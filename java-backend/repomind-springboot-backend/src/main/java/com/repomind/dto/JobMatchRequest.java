package com.repomind.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
public record JobMatchRequest(
 @JsonProperty("repository_url") @NotBlank @Pattern(regexp="^https://github\\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/?$") String repositoryUrl,
 @JsonProperty("job_description") @NotBlank @Size(max=20000) String jobDescription
) {}