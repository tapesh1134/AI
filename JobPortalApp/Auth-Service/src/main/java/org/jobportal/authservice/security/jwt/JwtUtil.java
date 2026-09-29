package org.jobportal.authservice.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.jobportal.authservice.entity.UserCredential;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {
    @Value("${spring.application.token.expiry}")
    private long expiry;
    @Value("${spring.application.key}")
    private String secret;

    public String generateToken(UserCredential user) {
        Map<String, Object> claims = new HashMap<>();

        claims.put("userId", user.getUserId());

        // Convert enum to ROLE_ format
        String role = user.getRole() != null ? "ROLE_" + user.getRole().name() : null;
        claims.put("roles", role != null ? List.of(role) : List.of()); // always store as list

        return Jwts.builder()
                .claims()
                .add(claims)
                .subject(user.getEmail()) // email as subject
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiry))
                .and()
                .signWith(getKey())
                .compact();
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> Long.valueOf(claims.get("userId").toString()));
    }

    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaim(token);
        return claims.get("roles", List.class);
    }

    public String extractUserEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean validateToken(String token) {
        return !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return  extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaim(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaim(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getKey())
                .build().parseSignedClaims(token)
                .getPayload();
    }

    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}