package com.social.friends.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchFriendStatusResponseDto {
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
        private Integer targetId;
        private String status;
    }

    // ✅ 친구 상태 조회 성공
    public static SearchFriendStatusResponseDto success(Integer userId, Integer targetId, String status) {
        return SearchFriendStatusResponseDto.builder()
                .code("SUCCESS")
                .message("Friend status retrieved successfully.")
                .data(new Data(userId, targetId, status))
                .build();
    }

    // ✅ 필수 필드 누락
    public static SearchFriendStatusResponseDto missingTargetId() {
        return SearchFriendStatusResponseDto.builder()
                .code("MISSING_TARGET_ID")
                .message("Target ID is required.")
                .build();
    }

    // ✅ 자기 자신 조회 불가
    public static SearchFriendStatusResponseDto cannotCheckSelf() {
        return SearchFriendStatusResponseDto.builder()
                .code("CANNOT_CHECK_SELF")
                .message("You cannot check your own friend status.")
                .build();
    }

    // ✅ 인증 오류
    public static SearchFriendStatusResponseDto unauthorized() {
        return SearchFriendStatusResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }

    // ✅ 서버 오류
    public static SearchFriendStatusResponseDto serverError() {
        return SearchFriendStatusResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .build();
    }
}
