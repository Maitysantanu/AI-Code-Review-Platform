
package com.repomind.service;

import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Component
public class PythonAnalysisClient {

    private final RestClient client;
    private final ObjectMapper objectMapper;

    public PythonAnalysisClient(
            RestClient pythonRestClient,
            ObjectMapper objectMapper) {
        this.client = pythonRestClient;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> analyzeRepository(String url) {
        return post("/analyze", Map.of(
            "repository_url", url
        ));
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
            // Serialize the request as a JSON String.
            String jsonBody = objectMapper.writeValueAsString(body);

            System.out.println("Python endpoint: " + path);
            System.out.println("Outgoing JSON: " + jsonBody);

            Map<String, Object> result = client.post()
                .uri(path)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonBody)
                .retrieve()
                .body(Map.class);

            if (result == null) {
                throw new PythonServiceException(
                    "Python service returned an empty response"
                );
            }

            return result;

        } catch (RestClientResponseException ex) {

            String message = "Python API returned HTTP "
                + ex.getStatusCode()
                + ": "
                + ex.getResponseBodyAsString();

            System.err.println(message);

            throw new PythonServiceException(message, ex);

        } catch (JsonProcessingException ex) {

            throw new PythonServiceException(
                "Could not serialize Python request",
                ex
            );

        } catch (RestClientException ex) {

            throw new PythonServiceException(
                "Python connection failed: " + ex.getMessage(),
                ex
            );
        }
    }
}
