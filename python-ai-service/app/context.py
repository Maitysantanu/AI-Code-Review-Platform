"""Repository chunking and hybrid lexical retrieval for RepoMind.

This module uses only the Python standard library. It preserves absolute
source line numbers and combines query-term relevance with file/path signals.
It is a lexical retriever, not a semantic-embedding retriever.
"""

from __future__ import annotations

import math
import re
from collections import Counter
from pathlib import PurePosixPath
from typing import Any
from functools import lru_cache
from sentence_transformers import SentenceTransformer

from app.config import MAX_REVIEW_CHUNKS


@lru_cache(maxsize=1)
def get_embedding_model():
    """
    Load the embedding model once and reuse it.
    """
    return SentenceTransformer(
        "sentence-transformers/all-MiniLM-L6-v2",
        device="cpu"
    )


def _semantic_scores(
    question: str,
    chunks: list[dict[str, Any]]
) -> list[float]:
    """
    Calculate cosine similarity between the question
    and repository chunks using normalized embeddings.
    """

    if not chunks:
        return []

    model = get_embedding_model()

    documents = [
        f"File: {chunk['path']}\n{chunk['content']}"
        for chunk in chunks
    ]

    texts = [question] + documents

    embeddings = model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False
    )

    query_embedding = embeddings[0]

    scores = []

    for document_embedding in embeddings[1:]:
        # Normalized vectors: dot product = cosine similarity.
        similarity = float(query_embedding @ document_embedding)

        scores.append(max(0.0, min(1.0, similarity)))

    return scores
# Keep generic question words from dominating lexical retrieval.
STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "can", "do",
    "does", "for", "from", "how", "i", "in", "is", "it", "of", "on",
    "or", "our", "please", "show", "tell", "that", "the", "this", "to",
    "use", "used", "using", "what", "when", "where", "which", "who",
    "why", "with", "you", "your", "explain", "describe", "work",
}

TOKEN_RE = re.compile(r"[a-zA-Z_][a-zA-Z0-9_+#.-]*")


def _tokens(text: str) -> list[str]:
    """Tokenize identifiers and technical terms while retaining useful symbols."""
    return [
        token.lower()
        for token in TOKEN_RE.findall(text or "")
        if len(token) > 1 and token.lower() not in STOP_WORDS
    ]


def _normalise_path(path: str) -> str:
    return str(path or "").replace("\\", "/").lower()


def split_repository_files(
    repo: dict[str, Any],
    max_chars: int = 7000,
    lines_per_chunk: int = 180,
) -> list[dict[str, Any]]:
    """Split fetched repository files into bounded chunks with accurate lines."""
    chunks: list[dict[str, Any]] = []
    files = repo.get("files", {}) or {}

    for path, raw_content in files.items():
        if not isinstance(raw_content, str) or not raw_content.strip():
            continue

        lines = raw_content.splitlines()
        offset = 0

        # Advance by the number of lines actually included. This avoids
        # dropping source lines when a chunk reaches max_chars early.
        while offset < len(lines):
            kept_lines: list[str] = []
            char_count = 0

            while offset + len(kept_lines) < len(lines) and len(kept_lines) < lines_per_chunk:
                line = lines[offset + len(kept_lines)]
                extra = len(line) + (1 if kept_lines else 0)

                # Always include one line, even if that line alone exceeds
                # max_chars, so the iterator cannot get stuck.
                if kept_lines and char_count + extra > max_chars:
                    break

                kept_lines.append(line[:max_chars] if not kept_lines and len(line) > max_chars else line)
                char_count += min(extra, max_chars) if len(kept_lines) == 1 else extra

            content = "\n".join(kept_lines).strip()
            consumed = len(kept_lines)

            if content:
                chunks.append({
                    "path": str(path),
                    "start_line": offset + 1,
                    "end_line": offset + consumed,
                    "content": content,
                })

            offset += max(consumed, 1)

    return chunks


def select_review_chunks(repo: dict[str, Any]) -> list[dict[str, Any]]:
    """Select high-value implementation chunks for repository code review."""
    ranked: list[tuple[float, dict[str, Any]]] = []

    important_path_terms = (
        "main", "app", "auth", "security", "api", "route", "controller",
        "service", "config", "database", "model", "middleware",
    )
    source_extensions = {
        ".py", ".java", ".js", ".jsx", ".ts", ".tsx", ".go", ".rs",
        ".cpp", ".c", ".cs", ".php", ".rb", ".kt", ".swift", ".sql",
    }

    for chunk in split_repository_files(repo):
        path = _normalise_path(chunk["path"])
        suffix = PurePosixPath(path).suffix
        score = 0.0

        if suffix in source_extensions:
            score += 3.0
        if any(term in path for term in important_path_terms):
            score += 2.5
        if any(term in path for term in ("test", "spec")):
            score += 0.5
        if any(term in path for term in ("vendor", "node_modules", "dist", "build", ".git")):
            score -= 5.0

        # Prefer chunks containing executable declarations over mostly blank
        # or comment-only chunks, without assuming a specific language.
        code_lines = sum(
            1 for line in chunk["content"].splitlines()
            if line.strip() and not line.lstrip().startswith(("#", "//", "/*", "*"))
        )
        score += min(code_lines / 40.0, 1.5)
        ranked.append((score, chunk))

    ranked.sort(key=lambda item: item[0], reverse=True)
    return [chunk for _, chunk in ranked[:MAX_REVIEW_CHUNKS]]


def _bm25_scores(query_terms: list[str], chunks: list[dict[str, Any]]) -> list[float]:
    """Small in-memory BM25-style scorer; no external search dependency."""
    tokenized = [_tokens(chunk["content"]) for chunk in chunks]
    doc_lengths = [len(tokens) for tokens in tokenized]
    avg_length = sum(doc_lengths) / max(len(doc_lengths), 1)
    document_frequency: Counter[str] = Counter()

    for tokens in tokenized:
        document_frequency.update(set(tokens))

    k1 = 1.5
    b = 0.75
    scores: list[float] = []
    unique_query_terms = set(query_terms)
    total_docs = len(chunks)

    for tokens, doc_length in zip(tokenized, doc_lengths):
        frequencies = Counter(tokens)
        score = 0.0

        for term in unique_query_terms:
            tf = frequencies.get(term, 0)
            if not tf:
                continue
            df = document_frequency[term]
            idf = math.log(1 + (total_docs - df + 0.5) / (df + 0.5))
            denominator = tf + k1 * (
                1 - b + b * doc_length / max(avg_length, 1)
            )
            score += idf * (tf * (k1 + 1)) / denominator

        scores.append(score)

    return scores


def retrieve_relevant_chunks(
    repo: dict[str, Any],
    question: str,
    limit: int = 5
) -> list[dict[str, Any]]:
    """
    Hybrid retrieval using:
    1. BM25 lexical matching
    2. Semantic embedding similarity
    3. Filename and path matching

    Returns the same chunk structure used by RepoMind.
    """

    if not isinstance(question, str) or not question.strip():
        return []

    try:
        limit = max(1, min(int(limit), 20))
    except (TypeError, ValueError):
        limit = 5

    chunks = split_repository_files(
        repo,
        max_chars=5000
    )

    if not chunks:
        return []

    query = question.strip()

    # ------------------------------------------------
    # 1. Lexical retrieval using BM25
    # ------------------------------------------------

    query_terms = _tokens(query)

    bm25 = _bm25_scores(
        query_terms,
        chunks
    )

    max_bm25 = max(bm25, default=0.0)

    # Normalize BM25 scores to the range 0-1.
    normalized_bm25 = [
        score / max_bm25 if max_bm25 > 0 else 0.0
        for score in bm25
    ]

    # ------------------------------------------------
    # 2. Semantic retrieval using embeddings
    # ------------------------------------------------

    semantic = _semantic_scores(
        query,
        chunks
    )

    # ------------------------------------------------
    # 3. Combine lexical and semantic scores
    # ------------------------------------------------

    query_lower = query.lower()
    query_term_set = set(query_terms)

    ranked = []

    for index, chunk in enumerate(chunks):

        path = _normalise_path(chunk["path"])
        content = chunk["content"].lower()

        path_tokens = set(_tokens(path))

        lexical_score = normalized_bm25[index]
        semantic_score = semantic[index]

        # Semantic retrieval receives higher weight.
        final_score = (
            0.65 * semantic_score
            + 0.35 * lexical_score
        )

        # Small additional reward for filename matches.
        path_match_count = len(
            query_term_set & path_tokens
        )

        final_score += min(
            path_match_count * 0.03,
            0.09
        )

        # Reward exact phrase matches.
        if len(query_lower) >= 4 and query_lower in content:
            final_score += 0.05

        final_score = min(final_score, 1.0)

        print(
            f"File: {chunk['path']} | "
            f"Semantic: {semantic_score:.3f} | "
            f"BM25: {bm25[index]:.3f} | "
            f"Final: {final_score:.3f}"
        )

        # Exclude chunks with very weak combined relevance.
        if final_score >= 0.18:

            ranked.append({
                **chunk,
                "semantic_score": round(semantic_score, 4),
                "bm25_score": round(bm25[index], 4),
                "retrieval_score": round(final_score, 4)
            })

    # ------------------------------------------------
    # 4. Rank by combined relevance
    # ------------------------------------------------

    ranked.sort(
        key=lambda item: item["retrieval_score"],
        reverse=True
    )

    # ------------------------------------------------
    # 5. Limit duplicate chunks from the same file
    # ------------------------------------------------

    selected = []
    selected_paths = Counter()

    for chunk in ranked:

        path = chunk["path"]

        if selected_paths[path] >= 2:
            continue

        selected.append(chunk)
        selected_paths[path] += 1

        if len(selected) >= limit:
            break

    return selected