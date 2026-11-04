import re

ALIASES = {
"python":["python"],"java":["java"],"javascript":["javascript","js"],"typescript":["typescript","ts"],
"c++":["c++","cpp"],"sql":["sql","mysql","postgresql","postgres"],"react":["react","react.js"],
"node.js":["node.js","nodejs"],"spring boot":["spring boot"],"fastapi":["fastapi"],"flask":["flask"],
"django":["django"],"machine learning":["machine learning"],"deep learning":["deep learning"],
"tensorflow":["tensorflow"],"pytorch":["pytorch"],"scikit-learn":["scikit-learn","sklearn"],
"nlp":["natural language processing","nlp"],"docker":["docker"],"kubernetes":["kubernetes","k8s"],
"aws":["aws","amazon web services"],"git":["git","github"],"rest api":["rest api","restful api"],
"html":["html"],"css":["css"],"mongodb":["mongodb"],"redis":["redis"],"linux":["linux"],
"pandas":["pandas"],"numpy":["numpy"],"hibernate":["hibernate"],"jpa":["jpa"]
}
def extract_skills(text):
    text = text.lower()
    return sorted(skill for skill, aliases in ALIASES.items()
                  if any(re.search(r"(?<![a-z0-9+#])"+re.escape(a)+r"(?![a-z0-9+#])", text) for a in aliases))

def match_job(repo, job_description):
    repo_skills = set(extract_skills("\n".join(repo["files"].values())))
    job_skills = set(extract_skills(job_description))
    matched = sorted(repo_skills & job_skills)
    missing = sorted(job_skills - repo_skills)
    additional = sorted(repo_skills - job_skills)
    score = round(100*len(matched)/len(job_skills)) if job_skills else 0
    explanation = (f"Repository evidence matched {len(matched)} of {len(job_skills)} recognized requested skills."
                   if job_skills else "No recognized skills were detected in the job description.")
    return {"match_score":score,"matched_skills":matched,"missing_skills":missing,
            "additional_repository_skills":additional,"explanation":explanation,
            "repository":repo["full_name"],
            "score_note":"Keyword-based baseline, not a trained ML model or a measure of candidate proficiency."}
