package com.social.friends.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendFriendResponseDto {
    private String code;
    private String message;
    private List<Data> data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer userId;
        private String nickname;
        private String profileImage;
        private Integer bridgeCount;
    }

    // ✅ 친구 추천 성공
    public static RecommendFriendResponseDto success(List<Data> recommendedFriends) {
        return RecommendFriendResponseDto.builder()
                .code("SUCCESS")
                .message(recommendedFriends.isEmpty() ? "No recommended friends found." : "Recommended friends retrieved successfully.")
                .data(recommendedFriends)
                .build();
    }

    // ✅ 인증 오류
    public static RecommendFriendResponseDto unauthorized() {
        return RecommendFriendResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }

    // ✅ 서버 오류
    public static RecommendFriendResponseDto serverError() {
        return RecommendFriendResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .build();
    }
}
