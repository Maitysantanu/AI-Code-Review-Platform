
import base64
import re
import httpx

from urllib.parse import quote

from app.config import (
    GITHUB_TOKEN,
    MAX_FILES,
    MAX_FILE_BYTES,
    MAX_TOTAL_BYTES
)

IGNORED = {
    ".git", "node_modules", "venv", ".venv",
    "__pycache__", "dist", "build", "target",
    "vendor", ".next"
}

EXTENSIONS = {
    ".py", ".java", ".js", ".jsx", ".ts", ".tsx",
    ".html", ".css", ".json", ".yml", ".yaml",
    ".md", ".sql", ".xml", ".properties", ".go",
    ".rs", ".cpp", ".c", ".h", ".php", ".rb"
}


def parse_github_url(url):
    match = re.match(
        r"^https?://(?:www\.)?github\.com/([^/]+)/([^/?#]+)",
        str(url)
    )

    if not match:
        raise ValueError("Please provide a valid GitHub repository URL.")

    return match.group(1), match.group(2).removesuffix(".git")


def check_github_response(response):
    if response.status_code in (403, 429):
        data = response.json() if response.headers.get(
            "content-type", ""
        ).startswith("application/json") else {}

        remaining = response.headers.get("X-RateLimit-Remaining")
        message = data.get("message", "Access denied")

        if remaining == "0":
            raise ValueError(
                "GitHub API rate limit exceeded. "
                "Check your GITHUB_TOKEN and retry after the reset period."
            )

        raise ValueError(
            f"GitHub access denied: {message}. "
            "Check your token permissions and repository access."
        )

    if response.status_code == 404:
        raise ValueError(
            "Repository or resource not found. "
            "Verify the URL and GitHub token permissions."
        )

    response.raise_for_status()


async def fetch_repository(url):
    owner, repo = parse_github_url(url)

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }

    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    async with httpx.AsyncClient(
        timeout=35,
        headers=headers,
        follow_redirects=True
    ) as client:

        # Fetch repository information
        response = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}"
        )

        check_github_response(response)

        info = response.json()
        branch = info.get("default_branch", "main")

        # Fetch repository file tree
        tree_url = (
            f"https://api.github.com/repos/{owner}/{repo}"
            f"/git/trees/{quote(branch, safe='')}"
        )

        tree_response = await client.get(
            tree_url,
            params={"recursive": "1"}
        )

        check_github_response(tree_response)

        tree = tree_response.json()

        if tree.get("truncated"):
            raise ValueError(
                "Repository tree is too large for current limits."
            )

        candidates = []

        for item in tree.get("tree", []):
            path = item.get("path", "")

            ext = (
                "." + path.rsplit(".", 1)[-1].lower()
                if "." in path else ""
            )

            if (
                item.get("type") == "blob"
                and ext in EXTENSIONS
                and not any(
                    part in IGNORED for part in path.split("/")
                )
            ):
                candidates.append((path, item.get("url")))

        contents = {}
        total = 0

        # Fetch source files
        for path, blob_url in candidates[:MAX_FILES]:

            if not blob_url:
                continue

            blob_response = await client.get(blob_url)

            if blob_response.status_code != 200:
                check_github_response(blob_response)
                continue

            blob = blob_response.json()

            if blob.get("encoding") != "base64":
                continue

            raw = base64.b64decode(blob.get("content", ""))

            if len(raw) > MAX_FILE_BYTES:
                continue

            if total + len(raw) > MAX_TOTAL_BYTES:
                continue

            try:
                text = raw.decode("utf-8")
            except UnicodeDecodeError:
                continue

            if "\x00" in text:
                continue

            contents[path] = text
            total += len(raw)

    if not contents:
        raise ValueError(
            "No supported source/documentation files found."
        )

    return {
        "full_name": f"{owner}/{repo}",
        "html_url": f"https://github.com/{owner}/{repo}",
        "default_branch": branch,
        "files": contents
    }
