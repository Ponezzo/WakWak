package com.social.friends.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendAcceptResponseDto {
    private String code;
    private String message;

    @JsonIgnore
    private Integer status;
    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer userId1;
        private Integer userId2;
    }

    // ✅ 성공 응답 (친구 요청 수락 성공)
    public static FriendAcceptResponseDto success(Integer senderId, Integer receiverId) {
        return FriendAcceptResponseDto.builder()
                .code("SUCCESS")
                .message("Friend request accepted successfully.")
                .status(200)  // HTTP 200 OK
                .data(new Data(senderId, receiverId))
                .build();
    }

    // ✅ 필수 필드 누락
    public static FriendAcceptResponseDto missingSenderId() {
        return FriendAcceptResponseDto.builder()
                .code("MISSING_SENDER_ID")
                .message("Sender ID is required.")
                .status(400)  // HTTP 400 Bad Request
                .build();
    }

    // ✅ 해당 친구 요청이 존재하지 않음
    public static FriendAcceptResponseDto requestNotFound() {
        return FriendAcceptResponseDto.builder()
                .code("FRIEND_REQUEST_NOT_FOUND")
                .message("No pending friend request from this user.")
                .status(404)  // HTTP 404 Not Found
                .build();
    }

    // ✅ 이미 친구 관계임
    public static FriendAcceptResponseDto alreadyFriends() {
        return FriendAcceptResponseDto.builder()
                .code("ALREADY_FRIENDS")
                .message("You are already friends with this user.")
                .status(409)  // HTTP 409 Conflict
                .build();
    }

    // ✅ 인증 오류
    public static FriendAcceptResponseDto unauthorized() {
        return FriendAcceptResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .status(401)  // HTTP 401 Unauthorized
                .build();
    }

    // ✅ 유효하지 않은 토큰
    public static FriendAcceptResponseDto invalidToken() {
        return FriendAcceptResponseDto.builder()
                .code("INVALID_TOKEN")
                .message("The provided token is invalid or expired.")
                .status(401)  // HTTP 401 Unauthorized
                .build();
    }

    // ✅ 서버 오류
    public static FriendAcceptResponseDto serverError() {
        return FriendAcceptResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .status(500)  // HTTP 500 Internal Server Error
                .build();
    }
}
