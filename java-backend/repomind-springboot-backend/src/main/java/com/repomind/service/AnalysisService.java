package com.repomind.service;
import java.util.Map;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.repomind.entity.*;
import com.repomind.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class AnalysisService {
 private final PythonAnalysisClient python;
 private final AnalysisReportRepository analyses;
 private final MatchingReportRepository matches;
 private final ObjectMapper mapper;
 public AnalysisService(PythonAnalysisClient p,AnalysisReportRepository a,MatchingReportRepository m,ObjectMapper o){python=p;analyses=a;matches=m;mapper=o;}
 @Transactional public Map<String,Object> analyze(String url){
  Map<String,Object> result=python.analyzeRepository(url);
  Double score=number(result.get("quality_score")); if(score==null)score=number(result.get("qualityScore"));
  analyses.save(new AnalysisReport(url,score,json(result))); return result;
 }
 @Transactional public Map<String,Object> match(String url,String jd){
  Map<String,Object> result=python.analyzeMatch(url,jd);
  Double score=number(result.get("match_score")); if(score==null)score=number(result.get("score"));
  matches.save(new MatchingReport(url,score,json(result))); return result;
 }
 public Map<String,Object> ask(String url,String question){return python.ask(url,question);}
 private Double number(Object v){return v instanceof Number n?n.doubleValue():null;}
 private String json(Map<String,Object> value){try{return mapper.writeValueAsString(value);}catch(JsonProcessingException e){throw new IllegalStateException("Could not serialize result",e);}}
}