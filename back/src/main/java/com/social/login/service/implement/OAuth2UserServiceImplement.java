package com.social.login.service.implement;

import com.social.starsky.service.StarSkyService;
import com.social.login.entity.CustomOAuth2User;
import com.social.login.entity.User;
import com.social.login.repository.UserRepository;
import com.social.login.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2UserServiceImplement extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final StarSkyService starSkyService;
    private final AuthService authService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        log.info("🔹 [OAuth2UserService] OAuth2 로그인 요청 - Provider: {}", request.getClientRegistration().getClientName());

        OAuth2User oAuth2User = super.loadUser(request);
        String oauthClientName = request.getClientRegistration().getClientName();
        String username = null;
        String email = "email@email.com";
        User user = null;
        String nickname = null;

        try {
            if ("kakao".equals(oauthClientName)) {
                username = "kakao_" + oAuth2User.getAttributes().get("id");
                nickname = "user_" + oAuth2User.getAttributes().get("id");
                user = new User(username, email, "kakao",nickname);
                log.info("✅ [OAuth2UserService] Kakao 사용자 정보 추출 완료 - ID: {}", username);
            } else if ("naver".equals(oauthClientName)) {
                Map<String, String> responseMap = (Map<String, String>) oAuth2User.getAttributes().get("response");
                username = "naver_" + responseMap.get("id").substring(0, 14);
                email = responseMap.get("email");
                nickname = "user_" + responseMap.get("id").substring(0, 14);
                user = new User(username, email, "naver",nickname);
                log.info("✅ [OAuth2UserService] Naver 사용자 정보 추출 완료 - ID: {}, Email: {}", username, email);
            } else {
                log.warn("⚠️ [OAuth2UserService] 지원되지 않는 OAuth2 제공자: {}", oauthClientName);
            }

            if (user != null) {
                if(!userRepository.existsByUsername(username)) {
                    userRepository.save(user);
                    log.info("✅ [OAuth2UserService] 사용자 저장 완료 - ID: {}", username);
                    User users=userRepository.findByUsername(username);

                    int userId=users.getUserId();
                    log.info("✅ [OAuth2UserService] userId 추출 - ID: {}", userId);

                    Integer minStarskyId = starSkyService.getMinStarskyIdByUserId(userId);
                    log.info("✅ [OAuth2UserService] 가장 빠른 별하늘ID 추출 - ID: {}", minStarskyId);

                    authService.updateUserConstellation(userId, minStarskyId);


                }
            }

        } catch (Exception exception) {
            log.error("❌ [OAuth2UserService] OAuth2 인증 중 오류 발생: {}", exception.getMessage(), exception);
            throw new OAuth2AuthenticationException(new OAuth2Error("oauth2_authentication_error"), exception.getMessage());

        }

        return new CustomOAuth2User(username);
    }
}
