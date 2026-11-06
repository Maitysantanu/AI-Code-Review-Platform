
package com.repomind.controller;

import com.repomind.dto.AuthResponse;
import com.repomind.dto.LoginRequest;
import com.repomind.dto.RegisterRequest;
import com.repomind.dto.UserResponse;
import com.repomind.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Register
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        UserResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    // Get currently logged-in user
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }
        UserResponse response =
                authService.getCurrentUser(authentication.getName());

        return ResponseEntity.ok(response);
    }
}
