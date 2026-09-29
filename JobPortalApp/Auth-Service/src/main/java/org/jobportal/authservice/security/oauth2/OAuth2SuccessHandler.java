//package org.jobportal.authservice.security.oauth2;
//
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.jobportal.authservice.entity.Role;
//import org.jobportal.authservice.entity.UserCredential;
//import org.jobportal.authservice.repository.AuthRepository;
//import org.jobportal.authservice.security.jwt.JwtUtil;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
//import org.springframework.stereotype.Component;
//
//import java.io.IOException;
//import java.util.Map;
//
//@Component
//public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
//    private final JwtUtil jwtUtil;
//    private final AuthRepository  authRepository;
//
//    @Value("${spring.application.token.expiry}")
//    private long expiryTime;
//
//    @Autowired
//    public OAuth2SuccessHandler(AuthRepository authRepository, JwtUtil jwtUtil) {
//        this.authRepository = authRepository;
//        this.jwtUtil = jwtUtil;
//    }
//
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
//        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
//
//        String provider = ((OAuth2AuthenticationToken) authentication)
//                .getAuthorizedClientRegistrationId()
//                .toUpperCase();
//
//        Map<String, Object> attributes = oAuth2User.getAttributes();
//
//        String email = null;
//
//        // Google
//        if (provider.equals("GOOGLE")) {
//            email = (String) attributes.get("email");
//        }
//
//        // GitHub
//        else if (provider.equals("GITHUB")) {
//            email = (String) attributes.get("email");
//            if (email == null) {
//                email = attributes.get("login") + "@github.com";
//            }
//        }
//
//        if (email == null) {
//            throw new RuntimeException("Email not found from OAuth provider");
//        }
//
//        UserCredential user = authRepository.findByEmail(email).orElse(null);
//        boolean isNewUser = false;
//
//        if (user == null) {
//            isNewUser = true;
//
//            user = UserCredential.builder()
//                    .email(email)
//                    .passwordHash(null)
//                    .provider(provider)
//                    .role(null) // No role yet (only when sign up using Oauth)
//                    .build();
//
//            authRepository.save(user);
//        }
//
//        String token = jwtUtil.generateToken(user);
//        response.addHeader(
//                "Set-Cookie",
//                String.format(
//                        "jwt=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax",
//                        token,
//                        expiryTime
//                )
//        );
//
//        String redirectUrl;
//        if (isNewUser) {
//            redirectUrl = "http://localhost:5173/select-role";
//        } else {
//            redirectUrl = "http://localhost:5173/dashboard";
//        }
//
//        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
//    }
//}
