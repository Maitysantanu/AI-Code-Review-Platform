import re
from collections import Counter

STOP = {"the","and","for","with","that","this","from","what","where","when","how","does","can","you","are","was","were","why","into","about","have","has","which","show","explain","please","tell","me","its","their"}
def terms(text):
    return [w for w in re.findall(r"[a-zA-Z_][a-zA-Z0-9_+#.-]{1,}", text.lower()) if w not in STOP]

def answer_question(repo, question):
    query = set(terms(question))
    ranked = []
    for path, content in repo["files"].items():
        counts = Counter(terms(content))
        score = sum(counts[t] for t in query)
        if score:
            ranked.append((score,path,"\n".join(content.splitlines()[:35])[:2500]))
    ranked.sort(reverse=True)
    selected = ranked[:3]
    if not selected:
        return {"answer":"I could not find enough matching information in the repository files. Ask about a filename, class, function, dependency, or technology.",
                "sources":[],"note":"This baseline retrieves repository text; it does not use an external LLM."}
    sources = [p for _,p,_ in selected]
    excerpts = "\n\n".join(f"FILE: {p}\n{text}" for _,p,text in selected)
    return {"answer":"I found potentially relevant repository excerpts. Review these files for the answer; this baseline does not synthesize an LLM explanation.\n\n"+excerpts[:6500],
            "sources":sources,"note":"Repository-grounded retrieval baseline; add an LLM provider for natural-language synthesis."}
