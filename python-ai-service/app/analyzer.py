import ast, re

SECRET = re.compile(r"""(?i)(password|passwd|api[_-]?key|secret|token)\s*[:=]\s*['"][^'"]{6,}['"]""")
CHECKS = [
 ("Possible eval() use", re.compile(r"\beval\s*\("), "Review dynamic evaluation; it can execute untrusted input."),
 ("Possible exec() use", re.compile(r"\bexec\s*\("), "Avoid executing dynamically constructed code."),
 ("Disabled TLS verification", re.compile(r"verify\s*=\s*False"), "Do not disable TLS verification in production."),
 ("Possible shell execution", re.compile(r"(?i)(shell\s*=\s*True|os\.system\s*\()"), "Avoid shell execution with untrusted input.")
]

def py_metrics(source):
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        return 0, 0, 0, exc
    funcs = sum(isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) for n in ast.walk(tree))
    classes = sum(isinstance(n, ast.ClassDef) for n in ast.walk(tree))
    branches = sum(isinstance(n, (ast.If,ast.For,ast.While,ast.Try,ast.BoolOp,ast.IfExp,ast.ExceptHandler)) for n in ast.walk(tree))
    return funcs, classes, branches, None

def analyze_repository(repo):
    issues, findings = [], []
    funcs = classes = complexity = tests = lines_total = 0
    for path, source in repo["files"].items():
        lines = source.splitlines()
        lines_total += len(lines)
        if "test" in path.lower() or path.lower().endswith((".spec.js",".test.js")):
            tests += 1
        if path.endswith(".py"):
            f,c,x,error = py_metrics(source)
            funcs += f; classes += c; complexity += x
            if error:
                issues.append({"file":path,"line":error.lineno or 1,"severity":"medium","type":"syntax_error","message":error.msg})
        if len(lines) > 500:
            issues.append({"file":path,"line":1,"severity":"low","type":"large_file","message":f"File contains {len(lines)} lines; consider splitting it."})
        for number,line in enumerate(lines,1):
            if SECRET.search(line):
                findings.append({"file":path,"line":number,"severity":"high","type":"possible_secret","message":"Possible hard-coded credential; verify and rotate if genuine."})
            for title,pattern,advice in CHECKS:
                if pattern.search(line):
                    findings.append({"file":path,"line":number,"severity":"medium","type":"security_review","message":f"{title}. {advice}"})
    score = max(0, min(100, 90 - min(35,len(issues)*2) - min(35,len(findings)*4) + (5 if tests else 0)))
    return {"quality_score":score,"issues":issues[:200],"security_findings":findings[:200],
            "metrics":{"files_analyzed":len(repo["files"]),"functions_analyzed":funcs,"classes_analyzed":classes,
                       "complexity_indicators":complexity,"test_files":tests,"lines_analyzed":lines_total},
            "repository":{"name":repo["full_name"],"url":repo["html_url"],"default_branch":repo["default_branch"]},
            "score_note":"Heuristic starter score based on limited checks; not a certified quality or security audit."}
