package com.social.friends.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestListResponseDto {
    private String code;
    private String message;
    private List<Data> data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer senderId;
        private String nickname;
        private String profileImage;
    }

    // ✅ 성공 응답 (친구 요청 있음)
    public static FriendRequestListResponseDto success(List<Data> requestList) {
        return FriendRequestListResponseDto.builder()
                .code("SUCCESS")
                .message("Friend requests retrieved successfully.")
                .data(requestList)
                .build();
    }

    // ✅ 친구 요청이 없음
    public static FriendRequestListResponseDto noRequests() {
        return FriendRequestListResponseDto.builder()
                .code("SUCCESS")
                .message("No pending friend requests.")
                .data(List.of()) // 빈 배열 반환
                .build();
    }

    // ✅ 인증 오류
    public static FriendRequestListResponseDto unauthorized() {
        return FriendRequestListResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .data(List.of())
                .build();
    }

    // ✅ 유효하지 않은 토큰
    public static FriendRequestListResponseDto invalidToken() {
        return FriendRequestListResponseDto.builder()
                .code("INVALID_TOKEN")
                .message("The provided token is invalid or expired.")
                .data(List.of())
                .build();
    }

    // ✅ 서버 오류
    public static FriendRequestListResponseDto serverError() {
        return FriendRequestListResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .data(List.of())
                .build();
    }
}
