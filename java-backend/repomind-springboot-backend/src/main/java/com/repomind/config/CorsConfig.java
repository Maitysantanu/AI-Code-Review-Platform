package com.repomind.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
@Configuration
public class CorsConfig implements WebMvcConfigurer {
 @Value("${app.cors.allowed-origins}") private String origins;
 @Override public void addCorsMappings(CorsRegistry registry) {
  registry.addMapping("/api/**").allowedOrigins(origins.split(","))
   .allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS").allowedHeaders("*");
 }
}