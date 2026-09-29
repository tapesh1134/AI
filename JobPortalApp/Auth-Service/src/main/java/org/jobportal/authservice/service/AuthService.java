package org.jobportal.authservice.service;

import org.jobportal.authservice.dto.LoginDto;
import org.jobportal.authservice.dto.RegisterDto;
import org.jobportal.authservice.entity.UserCredential;

public interface AuthService {
    UserCredential register(RegisterDto registerDto);
    String login(LoginDto loginDto);
    void logout();
    boolean validateToken(String token);
    String refreshToken(String token);
    UserCredential getByEmail(String email);
}
