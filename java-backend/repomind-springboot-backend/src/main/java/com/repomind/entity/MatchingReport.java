package com.repomind.entity;
import java.time.LocalDateTime;
import jakarta.persistence.*;
@Entity @Table(name="matching_reports")
public class MatchingReport {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="repository_url",nullable=false,length=500) private String repositoryUrl;
 @Column(name="match_score") private Double matchScore;
 @Lob @Column(name="result_json",columnDefinition="LONGTEXT") private String resultJson;
 @Column(name="created_at",nullable=false) private LocalDateTime createdAt;
 protected MatchingReport() {}
 public MatchingReport(String url, Double score, String json) { repositoryUrl=url; matchScore=score; resultJson=json; createdAt=LocalDateTime.now(); }
 public Long getId(){return id;}
}