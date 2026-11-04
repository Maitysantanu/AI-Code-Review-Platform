package com.repomind.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
@Configuration
public class PythonClientConfig {
 @Bean RestClient pythonRestClient(RestClient.Builder builder, @Value("${python.service.base-url}") String baseUrl) {
  return builder.baseUrl(baseUrl).build();
 }
}