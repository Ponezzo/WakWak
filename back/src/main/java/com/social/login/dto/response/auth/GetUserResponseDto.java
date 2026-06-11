package com.social.login.dto.response.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetUserResponseDto {
    private String code;
    private String message;
    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer userId;
        private String nickname;
        private String mediaUrl;
    }

    public static GetUserResponseDto success(Integer userId,String nickname, String mediaUrl) {
        return GetUserResponseDto.builder()
                .code("SUCCESS")
                .message("User profile retrieved successfully.")
                .data(new Data(userId,nickname, mediaUrl))
                .build();
    }

    public static GetUserResponseDto userNotFound() {
        return GetUserResponseDto.builder()
                .code("USER_NOT_FOUND")
                .message("User not found.")
                .build();
    }

    public static GetUserResponseDto authRequired() {
        return GetUserResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }

    public static GetUserResponseDto invalidToken() {
        return GetUserResponseDto.builder()
                .code("INVALID_TOKEN")
                .message("The provided token is invalid or expired.")
                .build();
    }
}
