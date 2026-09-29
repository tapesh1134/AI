package org.jobportal.authservice.service;

import org.jobportal.authservice.dto.LoginDto;
import org.jobportal.authservice.dto.RegisterDto;
import org.jobportal.authservice.entity.Role;
import org.jobportal.authservice.entity.UserCredential;
import org.jobportal.authservice.repository.AuthRepository;
import org.jobportal.authservice.security.jwt.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthRepository authRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthServiceImpl(AuthRepository authRepository, BCryptPasswordEncoder bCryptPasswordEncoder, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.authRepository = authRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public UserCredential register(RegisterDto registerDto) {

        if (registerDto.getRole() == Role.ADMIN) {
            throw new RuntimeException("ADMIN cannot be registered");
        }

        if (authRepository.existsByEmail(registerDto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        UserCredential user = UserCredential.builder()
                .email(registerDto.getEmail())
                .passwordHash(bCryptPasswordEncoder.encode(registerDto.getPassword()))
                .provider("LOCAL")
                .role(registerDto.getRole())
                .creationDate(LocalDateTime.now())
                .build();

        return authRepository.save(user);
    }

    @Override
    public String login(LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getEmail(),
                        loginDto.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        UserCredential user = authRepository.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));

        return jwtUtil.generateToken(user);
    }

    @Override
    public void logout() {
        // JWT is stateless → nothing to do here
    }

    @Override
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    @Override
    public String refreshToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }

        Long userId = jwtUtil.extractUserId(token);
        UserCredential user = authRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return jwtUtil.generateToken(user);
    }

    @Override
    public UserCredential getByEmail(String email) {
        return authRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
}