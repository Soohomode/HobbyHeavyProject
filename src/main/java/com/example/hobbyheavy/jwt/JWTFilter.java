package com.example.hobbyheavy.jwt;

import com.example.hobbyheavy.auth.CustomUserDetails;
import com.example.hobbyheavy.entity.User;
import com.example.hobbyheavy.exception.CustomException;
import com.example.hobbyheavy.type.UserRole;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    private final Long ACCESS_EXPIRED = 600000L;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // 인증이 필요 없는 경로들은 JWT 필터에서 제외
        if ("/join".equals(requestURI) || "/login".equals(requestURI) || "/reissue".equals(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        log.info("JWTFilter - Request URI: {}", request.getRequestURI());

        // 헤더에서 access키에 담긴 access토큰을 가져옴
        String accessToken = request.getHeader("access");

        // 토큰이 없다면 다음 필터로 넘김
        if (accessToken == null) {
            log.warn("JWTFilter - No access token found. Request URI: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        // Token 만료 여부 확인, 만료시 다음 필터로 넘기지 않음!!
        try {
            jwtUtil.isExpired(accessToken);
        } catch (ExpiredJwtException e) {
            log.error("JWTFilter - Access token expired for token: {}", accessToken);

            // Refresh 토큰 확인
            String refreshToken = request.getHeader("refresh");
            if (refreshToken == null || jwtUtil.isExpired(refreshToken)) {
                log.warn("JWTFilter - No valid refresh token found.");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().print("Access token expired and no valid refresh token. Please login again.");
                return;
            }

            // Refresh 토큰으로 새로운 Access 토큰 발급
            try {
                String userId = jwtUtil.getUserId(refreshToken);
                String role = jwtUtil.getRole(refreshToken);
                String newAccessToken = jwtUtil.createJwt("access", userId, role, ACCESS_EXPIRED);

                // 새로운 Access 토큰을 응답 헤더에 설정
                response.setHeader("access", newAccessToken);
                log.info("JWTFilter - New Access token issued for UserId: {}", userId);

                // JSON 형태로 응답
                ObjectMapper objectMapper = new ObjectMapper();
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");

                // JSON 객체 생성
                Map<String, String> tokenResponse = new HashMap<>();
                tokenResponse.put("accessToken", newAccessToken);

                // JSON 응답 전송
                response.getWriter().write(objectMapper.writeValueAsString(tokenResponse));
                response.setStatus(HttpServletResponse.SC_OK);

            } catch (Exception ex) {
                log.error("JWTFilter - Error issuing new access token: {}", ex.getMessage());
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().print("Failed to issue new access token.");
                return;
            }

            return; // 새로 발급했으므로 필터 체인 진행 종료
        }

        // 토큰이 access인지 확인 (발급시 페이로드에 명시)
        String category = jwtUtil.getCategory(accessToken);
        if (!"access".equals(category)) {
            log.error("JWTFilter - Invalid token category: {}, expected 'access'.", category);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().print("invalid access token category.");
            return;
        }

        // userId, role 값을 획득
        String userId = jwtUtil.getUserId(accessToken);
        String roleString = jwtUtil.getRole(accessToken);
        log.info("JWTFilter - UserId: {}, Role: {}", userId, roleString);

        // 열거형 Role 값으로 변환
        UserRole userRole;
        try {
            userRole = UserRole.valueOf(roleString);
        } catch (CustomException e) {
            log.error("JWTFilter - Invalid role: {}", roleString);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().print("invalid role");
            return;
        }

        // UserEntity 생성 및 역할 설정
        User user = User.builder()
                .userId(userId)
                .userRole(Collections.singleton(userRole))
                .build();


        // CustomUserDetails 생성
        CustomUserDetails customUserDetails = new CustomUserDetails(user);

        // Spring Security의 Authentication 설정
        Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);

        log.info("JWTFilter - Token parsed successfully for UserId: {}, Role: {}", userId, roleString);

        // 다음 필터로 넘김
        filterChain.doFilter(request, response);

    }
}
