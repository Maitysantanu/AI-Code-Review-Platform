
package com.repomind.service;

import com.repomind.dto.AuthResponse;
import com.repomind.dto.LoginRequest;
import com.repomind.dto.RegisterRequest;
import com.repomind.dto.UserResponse;
import com.repomind.entity.User;
import com.repomind.repository.UserRepository;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    // Register new user
    public UserResponse register(RegisterRequest request) {

        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists"
            );
        }

        User user = new User();

        user.setName(request.name().trim());
        user.setEmail(email);

        // Hash password before saving
        user.setPassword(
                passwordEncoder.encode(request.password())
        );

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );
    }

    // Login existing user
    public AuthResponse login(LoginRequest request) {

        String email = request.email().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.password()
                )
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }

    // Get currently authenticated user
    public UserResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
}
