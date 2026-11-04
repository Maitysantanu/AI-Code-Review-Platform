import os, re, base64, httpx

MAX_FILES = int(os.getenv("MAX_FILES", "150"))
MAX_FILE_BYTES = int(os.getenv("MAX_FILE_BYTES", "200000"))
MAX_TOTAL_BYTES = int(os.getenv("MAX_TOTAL_BYTES", "5000000"))
IGNORED = {".git", "node_modules", "venv", ".venv", "__pycache__", "dist", "build", "target", "vendor"}
EXTENSIONS = {".py",".java",".js",".jsx",".ts",".tsx",".html",".css",".json",".yml",".yaml",".md",".sql",".xml",".properties",".go",".rs",".cpp",".c",".h",".php",".rb"}

def parse_github_url(url):
    m = re.match(r"^https?://(?:www\.)?github\.com/([^/]+)/([^/?#]+)", str(url))
    if not m:
        raise ValueError("Please provide a valid GitHub repository URL.")
    return m.group(1), m.group(2).removesuffix(".git")

async def fetch_repository(url):
    owner, repo = parse_github_url(url)
    headers = {"Accept":"application/vnd.github+json", "X-GitHub-Api-Version":"2022-11-28"}
    token = os.getenv("GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=30, headers=headers, follow_redirects=True) as client:
        r = await client.get(f"https://api.github.com/repos/{owner}/{repo}")
        if r.status_code == 404:
            raise ValueError("Repository not found or private. Check URL and token permissions.")
        if r.status_code == 403:
            raise ValueError("GitHub rate limit/access restriction. Configure GITHUB_TOKEN in .env.")
        r.raise_for_status()
        info = r.json()
        branch = info.get("default_branch", "main")
        tr = await client.get(f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}", params={"recursive":"1"})
        tr.raise_for_status()
        tree = tr.json()
        if tree.get("truncated"):
            raise ValueError("Repository tree is too large for this starter service.")
        candidates = []
        for item in tree.get("tree", []):
            path = item.get("path", "")
            ext = "." + path.rsplit(".", 1)[-1].lower() if "." in path else ""
            if item.get("type") == "blob" and ext in EXTENSIONS and not any(p in IGNORED for p in path.split("/")):
                candidates.append((path, item.get("url")))
        contents, total = {}, 0
        for path, blob_url in candidates[:MAX_FILES]:
            response = await client.get(blob_url)
            if response.status_code != 200:
                continue
            blob = response.json()
            if blob.get("encoding") != "base64":
                continue
            raw = base64.b64decode(blob.get("content", ""))
            if len(raw) > MAX_FILE_BYTES or total + len(raw) > MAX_TOTAL_BYTES:
                continue
            try:
                content = raw.decode("utf-8")
            except UnicodeDecodeError:
                continue
            if "\x00" in content:
                continue
            contents[path] = content
            total += len(raw)
    if not contents:
        raise ValueError("No supported source/documentation files found.")
    return {"full_name":f"{owner}/{repo}", "html_url":f"https://github.com/{owner}/{repo}",
            "default_branch":branch, "files":contents}
