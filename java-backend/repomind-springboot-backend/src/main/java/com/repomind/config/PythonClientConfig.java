
package com.repomind.config;

import java.net.http.HttpClient;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class PythonClientConfig {

    @Bean
    public RestClient pythonRestClient(
            RestClient.Builder builder,
            @Value("${python.service.base-url}") String baseUrl) {

        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(15))
                .build();

        JdkClientHttpRequestFactory requestFactory =
                new JdkClientHttpRequestFactory(httpClient);

        requestFactory.setReadTimeout(Duration.ofSeconds(300));

        return builder
                .baseUrl(baseUrl.trim().replaceAll("/+$", ""))
                .requestFactory(requestFactory)
                .build();
    }
}
