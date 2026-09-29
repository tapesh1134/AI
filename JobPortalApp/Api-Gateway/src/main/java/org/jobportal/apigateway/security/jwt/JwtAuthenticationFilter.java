package org.jobportal.apigateway.security.jwt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter {
    private final JwtUtil jwtUtil;

    @Autowired
    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    private final List<String> openEndpoints = List.of(
            "/auth/login",
            "/auth/register",
            "/auth/oauth2"
    );
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().name();
        if (path.equals("/history") && method.equals("POST")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }
        // Allow public endpoints
        if (isOpenEndpoint(path)) {
            return chain.filter(exchange);
        }

        //  Check JWT cookie
        var cookies = exchange.getRequest().getCookies();
        if (!cookies.containsKey("jwt")) {
            return onError(exchange);
        }

        String token = cookies.getFirst("jwt").getValue();
        try {
            //  Only validate (do NOT extract or mutate)
            jwtUtil.validateAndExtractClaims(token);
            return chain.filter(exchange);
        } catch (Exception e) {
            return onError(exchange);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    private boolean isOpenEndpoint(String path) {
        String normalizedPath = path.startsWith("/api/") ? path.substring(4) : path;
        return openEndpoints.stream().anyMatch(endpoint ->
                normalizedPath.equals(endpoint) || normalizedPath.startsWith(endpoint + "/"));
    }
}
