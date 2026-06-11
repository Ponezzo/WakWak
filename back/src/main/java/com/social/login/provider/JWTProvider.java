package com.social.login.provider;

import com.social.login.entity.User;
import com.social.login.repository.UserRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@Slf4j
@Service
@ConfigurationProperties(prefix = "jwt") // application.properties에서 자동으로 secret-key 매핑
@RequiredArgsConstructor
public class JWTProvider {

    private final UserRepository userRepository;
    private Key key;  // final 제거

    // 🔹 Setter 추가 (Spring이 application.properties에서 값을 자동 주입)
    public void setSecretKey(String secretKey) {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalArgumentException("❌ [JWTProvider] secret-key가 설정되지 않았습니다!");
        }
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        log.info("✅ [JWTProvider] JWT 키 설정 완료");
    }

    /**
     * ✅ JWT 토큰 생성 (Access Token)
     */
    public String createToken(String username) {
        // DB에서 username으로 userId 찾기
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("❌ [JWTProvider] 해당 유저를 찾을 수 없음: " + username);
        }

        Integer userId = user.getUserId(); // userId 가져오기
        Date expiredDate = Date.from(Instant.now().plus(1, ChronoUnit.HOURS)); // ⏳ 1시간 유지

        return Jwts.builder()
                .signWith(key, SignatureAlgorithm.HS256)
                .setSubject(userId.toString()) // userId를 Subject로 저장
                .setIssuedAt(new Date())
                .setExpiration(expiredDate)
                .compact();
    }

    /**
     * ✅ JWT 토큰 검증 (자동 재발급 포함)
     */
    public Optional<String> validateTokenWithAutoRenew(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String userIdString = claims.getSubject();
            Integer userId = Integer.parseInt(userIdString);

            log.info("✅ [JWTProvider] JWT 검증 성공 - 사용자 ID: {}", userId);
            return Optional.of(token); // 기존 토큰 그대로 사용 가능
        } catch (ExpiredJwtException expiredException) {
            log.warn("⚠️ [JWTProvider] JWT 만료됨 - 새로운 Access Token 발급 시도");

            // 만료된 JWT에서 사용자 ID 추출
            String userIdString = expiredException.getClaims().getSubject();
            Integer userId = Integer.parseInt(userIdString);

            // 새 Access Token 생성
            String newToken = createTokenByUserId(userId);
            log.info("🔄 [JWTProvider] 새 Access Token 발급 완료 - 사용자 ID: {}", userId);
            return Optional.of(newToken);
        } catch (Exception exception) {
            log.error("❌ [JWTProvider] JWT 검증 실패: {}", exception.getMessage());
            return Optional.empty();
        }
    }

    /**
     * ✅ 사용자 ID로 새 Access Token 생성 (자동 재발급용)
     */
    public String createTokenByUserId(Integer userId) {
        Date expiredDate = Date.from(Instant.now().plus(1, ChronoUnit.HOURS));

        return Jwts.builder()
                .signWith(key, SignatureAlgorithm.HS256)
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(expiredDate)
                .compact();
    }

    /**
     * ✅ JWT에서 사용자 ID 추출
     */
    public Integer getUserIdFromToken(String token) {
        return validateTokenWithAutoRenew(token).map(this::extractUserId).orElse(null);
    }

    private Integer extractUserId(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return Integer.parseInt(claims.getSubject());
        } catch (Exception e) {
            log.error("❌ [JWTProvider] 사용자 ID 추출 실패: {}", e.getMessage());
            return null;
        }
    }
}
