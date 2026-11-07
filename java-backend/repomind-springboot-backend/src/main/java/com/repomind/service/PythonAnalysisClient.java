
package com.repomind.service;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Component
public class PythonAnalysisClient {

    private final RestClient client;

    public PythonAnalysisClient(RestClient pythonRestClient) {
        this.client = pythonRestClient;
    }

    public Map<String, Object> analyzeRepository(String url) {
        return post("/analyze", Map.of("repository_url", url));
    }

    public Map<String, Object> analyzeMatch(String url, String jd) {
        return post("/matching/analyze", Map.of(
            "repository_url", url,
            "job_description", jd
        ));
    }

    public Map<String, Object> ask(String url, String question) {
        return post("/learning/ask", Map.of(
            "repository_url", url,
            "question", question
        ));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> post(
            String path,
            Map<String, Object> body) {

        try {
            Map<String, Object> result = client.post()
                .uri(path)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

            if (result == null) {
                throw new PythonServiceException(
                    "Python service returned an empty response"
                );
            }

            return result;

        } catch (RestClientResponseException ex) {

            String errorMessage =
                "Python API returned HTTP " + ex.getStatusCode()
                + ": " + ex.getResponseBodyAsString();

            System.err.println(errorMessage);

            throw new PythonServiceException(errorMessage, ex);

        } catch (RestClientException ex) {

            System.err.println(
                "Python connection failed: " + ex.getMessage()
            );

            throw new PythonServiceException(
                "Could not connect to Python AI service: "
                + ex.getMessage(),
                ex
            );
        }
    }
}
