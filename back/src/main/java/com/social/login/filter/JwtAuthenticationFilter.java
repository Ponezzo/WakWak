package com.social.login.filter;

import com.social.login.entity.User;
import com.social.login.provider.JWTProvider;
import com.social.login.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final JWTProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String clientIp = request.getRemoteAddr();  // 요청한 클라이언트 IP 주소
        String userAgent = request.getHeader("User-Agent");
        String referer = request.getHeader("Referer");
        log.info("🔹 [JwtAuthenticationFilter] 요청 시작: {} (IP: {}, User-Agent: {}, Referer: {})", requestURI, clientIp, userAgent, referer);


        // ✅ 해당 경로에만 검증하겠다.
        if (isExcludedPath(requestURI)) {
            log.warn("🔹 [JwtAuthenticationFilter] 인증 필요함");
            String token = parseBearerToken(request);
            
            if (token == null || token.trim().isEmpty()) {
                log.warn("❌ [JwtAuthenticationFilter] 인증 실패 - 토큰 없음");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "토큰이 없습니다.");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("{\"code\": \"NP\", \"message\": \"토큰이 없습니다.\"}");
                return;
            }

            Optional<String> newAccessTokenOpt = jwtProvider.validateTokenWithAutoRenew(token);

            if (newAccessTokenOpt.isEmpty()) {
                log.warn("❌ [JwtAuthenticationFilter] 인증 실패 - 유효하지 않은 토큰");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("{\"code\": \"NP\", \"message\": \"유효하지 않은 토큰입니다.\"}");

                return;
            }

            String newAccessToken = newAccessTokenOpt.get();
            if (!newAccessToken.equals(token)) {
                response.setHeader("Authorization", "Bearer " + newAccessToken);
                log.info("🔄 [JwtAuthenticationFilter] 새 Access Token 발급 완료");
            }

            Integer userId = jwtProvider.getUserIdFromToken(newAccessToken);
            if (userId != null) {
                List<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userId, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.info("🔑 [JwtAuthenticationFilter] 인증된 user_id: {}", userId);
                request.setAttribute("userId", userId);
            } else {
                log.warn("❌ [JwtAuthenticationFilter] 인증 실패 - 사용자 ID 추출 실패");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "유효하지 않은 사용자 정보입니다.");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("{\"code\": \"NP\", \"message\": \"유효하지 않은 사용자 정보입니다\"}");
                return;
            }

            filterChain.doFilter(request, response);
            log.info("🔹 [JwtAuthenticationFilter] 필터 체인 완료, 컨트롤러로 이동");
        }
        else{
            log.info("✅ [JwtAuthenticationFilter] {} 경로는 인증 없이 접근 가능", requestURI);
            filterChain.doFilter(request, response);
            return;
        }


    }

    /**
     * ✅ 인증이 필요 한 경로 확인 메서드
     */
    private boolean isExcludedPath(String requestURI) {
        return requestURI.startsWith("/star-sky") ||
                requestURI.startsWith("/star-diary") ||
                requestURI.startsWith("/constellations") ||
                requestURI.startsWith("/friends") ||
                requestURI.startsWith("/inventory") ||
                requestURI.startsWith("/time-capsules") ||
                requestURI.startsWith("/bottle") ||
                requestURI.startsWith("/tmp") ||
                requestURI.equals("/users/nickname") ||
                requestURI.equals("/users/profile-image") ||
                requestURI.equals("/users/device") ||
                requestURI.equals("/users")||
                requestURI.equals("/users/");
    }

    /**
     * Authorization 헤더에서 Bearer 토큰을 추출하는 메서드
     */
    private String parseBearerToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");

        if (!StringUtils.hasText(authorization)) {
            log.warn("❌ [JwtAuthenticationFilter] Authorization 헤더 없음");
            return null;
        }

        if (!authorization.startsWith("Bearer ")) {
            log.warn("❌ [JwtAuthenticationFilter] Bearer 토큰 아님: {}", authorization);
            return null;
        }

        String token = authorization.substring(7);
        log.debug("🔹 [JwtAuthenticationFilter] 추출된 JWT: {}", token);
        return token;
    }
}
