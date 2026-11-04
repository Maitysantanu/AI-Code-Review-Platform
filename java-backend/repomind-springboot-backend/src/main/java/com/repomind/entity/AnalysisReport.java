package com.repomind.entity;
import java.time.LocalDateTime;
import jakarta.persistence.*;
@Entity @Table(name="analysis_reports")
public class AnalysisReport {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="repository_url",nullable=false,length=500) private String repositoryUrl;
 @Column(name="quality_score") private Double qualityScore;
 @Lob @Column(name="result_json",columnDefinition="LONGTEXT") private String resultJson;
 @Column(name="created_at",nullable=false) private LocalDateTime createdAt;
 protected AnalysisReport() {}
 public AnalysisReport(String url, Double score, String json) { repositoryUrl=url; qualityScore=score; resultJson=json; createdAt=LocalDateTime.now(); }
 public Long getId(){return id;}
}