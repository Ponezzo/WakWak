package com.social.friends.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendSearchResponseDto {
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
    }

    // ✅ 검색 성공 (결과 있음)
    public static FriendSearchResponseDto success(List<Data> friends) {
        return FriendSearchResponseDto.builder()
                .code("SUCCESS")
                .message("Friends search results retrieved successfully.")
                .data(friends)
                .build();
    }

    // ✅ 검색 결과 없음
    public static FriendSearchResponseDto noResults() {
        return FriendSearchResponseDto.builder()
                .code("SUCCESS")
                .message("No matching friends found.")
                .data(List.of())
                .build();
    }

    // ✅ 필수 필드 누락
    public static FriendSearchResponseDto missingNickname() {
        return FriendSearchResponseDto.builder()
                .code("MISSING_NICKNAME")
                .message("Nickname parameter is required.")
                .build();
    }

    // ✅ 인증 오류
    public static FriendSearchResponseDto unauthorized() {
        return FriendSearchResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }

    // ✅ 서버 오류
    public static FriendSearchResponseDto serverError() {
        return FriendSearchResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .build();
    }
}
