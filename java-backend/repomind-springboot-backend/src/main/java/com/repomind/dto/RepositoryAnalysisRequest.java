package com.repomind.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
public record RepositoryAnalysisRequest(
 @JsonProperty("repository_url") @NotBlank(message="Repository URL is required")
 @Pattern(regexp="^https://github\\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/?$", message="Provide a valid GitHub repository URL") String repositoryUrl
) {}