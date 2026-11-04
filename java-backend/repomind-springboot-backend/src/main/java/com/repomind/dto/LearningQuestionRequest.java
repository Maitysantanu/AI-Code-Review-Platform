package com.repomind.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
public record LearningQuestionRequest(
 @JsonProperty("repository_url") @NotBlank @Pattern(regexp="^https://github\\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/?$") String repositoryUrl,
 @NotBlank @Size(max=4000) String question
) {}