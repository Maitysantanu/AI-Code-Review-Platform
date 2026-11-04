package com.repomind.service;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;
@Component
public class PythonAnalysisClient {
 private final RestClient client;
 public PythonAnalysisClient(RestClient pythonRestClient){client=pythonRestClient;}
 public Map<String,Object> analyzeRepository(String url){return post("/analyze",Map.of("repository_url",url));}
 public Map<String,Object> analyzeMatch(String url,String jd){return post("/matching/analyze",Map.of("repository_url",url,"job_description",jd));}
 public Map<String,Object> ask(String url,String question){return post("/learning/ask",Map.of("repository_url",url,"question",question));}
 @SuppressWarnings("unchecked") private Map<String,Object> post(String path,Map<String,Object> body){
  try {
   Map<String,Object> result=client.post().uri(path).contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(Map.class);
   if(result==null) throw new PythonServiceException("Python service returned an empty response");
   return result;
  } catch(RestClientException ex){throw new PythonServiceException("Python AI service is unavailable or returned an error. Check FastAPI and its endpoint contract.",ex);}
 }
}