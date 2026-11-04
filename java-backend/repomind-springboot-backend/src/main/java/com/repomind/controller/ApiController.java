package com.repomind.controller;
import java.util.Map;
import com.repomind.dto.*;
import com.repomind.service.AnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api")
public class ApiController {
 private final AnalysisService service;
 public ApiController(AnalysisService service){this.service=service;}
 @PostMapping("/repositories/analyze") public ResponseEntity<Map<String,Object>> analyze(@Valid @RequestBody RepositoryAnalysisRequest r){return ResponseEntity.ok(service.analyze(r.repositoryUrl()));}
 @PostMapping("/matching/analyze") public ResponseEntity<Map<String,Object>> match(@Valid @RequestBody JobMatchRequest r){return ResponseEntity.ok(service.match(r.repositoryUrl(),r.jobDescription()));}
 @PostMapping("/learning/ask") public ResponseEntity<Map<String,Object>> ask(@Valid @RequestBody LearningQuestionRequest r){return ResponseEntity.ok(service.ask(r.repositoryUrl(),r.question()));}
}