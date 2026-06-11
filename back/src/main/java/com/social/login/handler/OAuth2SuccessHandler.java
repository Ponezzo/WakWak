package com.social.login.handler;

import com.social.login.entity.CustomOAuth2User;
import com.social.login.provider.JWTProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JWTProvider jwtProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        try {
            CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
            String username = oAuth2User.getName();
            String token = jwtProvider.createToken(username);
            String expiration = "3600";

            String redirectUrl = "https://i12e207.p.ssafy.io/auth/oauth-response?token=" + token + "&exp=" + expiration;

            response.sendRedirect(redirectUrl);


//
//            log.info("✅ [OAuth2SuccessHandler] OAuth2 로그인 성공 - 사용자명: {}", username);
//            log.info("🔹 [OAuth2SuccessHandler] 발급된 JWT: {}", token);
//            log.info("🔹 [OAuth2SuccessHandler] 리다이렉트 URL: {}", redirectUrl);
//
//            response.setHeader("Authorization", "Bearer " + token);
//
//            // ✅ Spring Security 기본 인증 속성 제거 (자동 요청 방지)
//            clearAuthenticationAttributes(request);
//
//            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
//            log.info("🔹 이동 {} ",redirectUrl);

        } catch (Exception e) {
            log.error("❌ [OAuth2SuccessHandler] OAuth2 인증 성공 처리 중 오류 발생: {}", e.getMessage(), e);
            throw new ServletException("OAuth2 인증 성공 후 처리 실패", e);
        }
    }

}
