import re
from collections import Counter
from app.config import MAX_REVIEW_CHUNKS

def split_repository_files(repo,max_chars=7000):
    chunks=[]
    for path,content in repo['files'].items():
        lines=content.splitlines()
        for start in range(0,len(lines),180):
            segment=lines[start:start+180]; text='\n'.join(segment)
            if text.strip(): chunks.append({'path':path,'start_line':start+1,'end_line':start+len(segment),'content':text[:max_chars]})
    return chunks

def select_review_chunks(repo):
    ranked=[]
    for c in split_repository_files(repo):
        p=c['path'].lower(); score=0
        if any(x in p for x in ('main','app','auth','security','api','route','controller','service')): score+=4
        if any(x in p for x in ('test','spec')): score+=1
        if p.endswith(('.py','.java','.js','.jsx','.ts','.tsx')): score+=2
        ranked.append((score,c))
    ranked.sort(key=lambda x:x[0],reverse=True)
    return [c for _,c in ranked[:MAX_REVIEW_CHUNKS]]

def retrieve_relevant_chunks(repo,question,limit=5):
    query=set(re.findall(r'[a-zA-Z_][a-zA-Z0-9_+#.-]{1,}',question.lower())); ranked=[]
    for c in split_repository_files(repo,5000):
        counts=Counter(re.findall(r'[a-zA-Z_][a-zA-Z0-9_+#.-]{1,}',c['content'].lower()))
        score=sum(counts[t] for t in query)
        if any(t in c['path'].lower() for t in query): score+=5
        if score: ranked.append((score,c))
    ranked.sort(key=lambda x:x[0],reverse=True)
    return [c for _,c in ranked[:limit]]
