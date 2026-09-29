package org.jobportal.authservice.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.jobportal.authservice.dto.ApiResponse;
import org.jobportal.authservice.dto.LoginDto;
import org.jobportal.authservice.dto.RegisterDto;
import org.jobportal.authservice.entity.Role;
import org.jobportal.authservice.entity.UserCredential;
import org.jobportal.authservice.repository.AuthRepository;
import org.jobportal.authservice.security.jwt.JwtUtil;
import org.jobportal.authservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthResource {
    private final JwtUtil jwtUtil;
    @Value("${spring.application.token.expiry}")
    private long expiry;

    private final AuthService authService;
    private final AuthRepository authRepository;

    @Autowired
    public AuthResource(AuthService authService, AuthRepository authRepository, JwtUtil jwtUtil) {
        this.authService = authService;
        this.authRepository = authRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserCredential>> register(@RequestBody RegisterDto registerDto) {
        // Prevent ADMIN registration
        if (registerDto.getRole() == Role.ADMIN) {
            throw new RuntimeException("ADMIN cannot be registered via public API");
        }
        UserCredential userCredential = authService.register(registerDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "User Created", userCredential));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@RequestBody LoginDto loginDto) {
        String token = authService.login(loginDto);
        return ResponseEntity.status(HttpStatus.OK).header("Set-Cookie",
                        String.format("jwt=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax", token, expiry)
                ).body(new ApiResponse<>(true, "User Logged In"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout() {
        return ResponseEntity.status(HttpStatus.OK).header("Set-Cookie",
                        "jwt=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax")
                .body(new ApiResponse<>(true, "User Logged Out"));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<UserCredential>> validateToken(Authentication authentication) {
        if(authentication == null || !authentication.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(false, "session not found", null));
        }
        UserCredential user = authService.getByEmail(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "User fetched successfully", user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refreshToken(HttpServletRequest request) {
        String token = extractTokenFromCookies(request);
        String newToken = authService.refreshToken(token);

        return ResponseEntity.ok(new ApiResponse<>(true, "Token refreshed", newToken));
    }

    // This function to extract token from cookie
    private String extractTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) {
            throw new RuntimeException("No cookies found");
        }
        for (Cookie cookie : request.getCookies()) {
            if ("jwt".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        throw new RuntimeException("JWT cookie not found");
    }

    @PutMapping("/role")
    public ResponseEntity<?> updateRole(Authentication authentication, @RequestParam String role) {
        String email = authentication.getName();
        UserCredential user = authService.getByEmail(email);

        // Self-service selection must never grant ADMIN access.
        Role requestedRole;
        try {
            requestedRole = Role.valueOf(role.toUpperCase(java.util.Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Invalid role", null));
        }
        if (requestedRole == Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "ADMIN cannot be self-assigned", null));
        }
        // ONLY SET IF ROLE IS NOT ALREADY SET
        if (user.getRole() == null) {
            user.setRole(requestedRole);
            authRepository.save(user);
        }
        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok()
                .header("Set-Cookie", String.format("jwt=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax", token, expiry))
                .body(new ApiResponse<>(true, "User Role Updated", user));
    }
}