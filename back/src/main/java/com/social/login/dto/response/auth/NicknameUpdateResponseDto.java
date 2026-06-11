package com.social.login.dto.response.auth;

import lombok.*;
import org.springframework.http.HttpStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NicknameUpdateResponseDto {
    private String code;
    private String message;
    private HttpStatus httpStatus;
    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer userId;
        private String nickname;
    }

    // ✅ 성공 응답 (닉네임 변경 성공)
    public static NicknameUpdateResponseDto success(Integer userId, String nickname) {
        return NicknameUpdateResponseDto.builder()
                .code("SUCCESS")
                .message("Nickname updated successfully.")
                .httpStatus(HttpStatus.OK)
                .data(new Data(userId, nickname))
                .build();
    }

    // ✅ 중복 닉네임 오류 (409 Conflict)
    public static NicknameUpdateResponseDto duplicateNickname() {
        return NicknameUpdateResponseDto.builder()
                .code("DUPLICATE_NICKNAME")
                .message("This nickname is already taken.")
                .httpStatus(HttpStatus.CONFLICT)
                .build();
    }

    // ✅ 유효하지 않은 닉네임 오류 (400 Bad Request)
    public static NicknameUpdateResponseDto invalidNickname() {
        return NicknameUpdateResponseDto.builder()
                .code("INVALID_NICKNAME")
                .message("Nickname must be between 2 and 20 characters and cannot contain spaces or special characters.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    // ✅ 인증 오류 (401 Unauthorized)
    public static NicknameUpdateResponseDto unauthorized() {
        return NicknameUpdateResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }
}
