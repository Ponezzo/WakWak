package com.social.friends.dto.response;

import lombok.*;
import org.springframework.http.HttpStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestResponseDto {
    private String code;
    private String message;
    private Data data;
    private HttpStatus httpStatus; // ✅ HTTP 상태 코드 필드 추가

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer senderId;
        private Integer receiverId;
    }

    // ✅ 성공 응답
    public static FriendRequestResponseDto success(Integer senderId, Integer receiverId) {
        return FriendRequestResponseDto.builder()
                .code("SUCCESS")
                .message("Friend request sent successfully.")
                .data(new Data(senderId, receiverId))
                .httpStatus(HttpStatus.CREATED) // ✅ 201 Created
                .build();
    }

    // ✅ 필수 필드 누락
    public static FriendRequestResponseDto missingReceiverId() {
        return FriendRequestResponseDto.builder()
                .code("MISSING_RECEIVER_ID")
                .message("Receiver ID is required.")
                .httpStatus(HttpStatus.BAD_REQUEST) // ✅ 400 Bad Request
                .build();
    }

    // ✅ 이미 친구 관계임
    public static FriendRequestResponseDto alreadyFriends() {
        return FriendRequestResponseDto.builder()
                .code("ALREADY_FRIENDS")
                .message("You are already friends with this user.")
                .httpStatus(HttpStatus.CONFLICT) // ✅ 409 Conflict
                .build();
    }

    // ✅ 이미 친구 요청 존재
    public static FriendRequestResponseDto requestAlreadyExists() {
        return FriendRequestResponseDto.builder()
                .code("REQUEST_ALREADY_EXISTS")
                .message("A pending friend request already exists between you and this user.")
                .httpStatus(HttpStatus.CONFLICT) // ✅ 409 Conflict
                .build();
    }

    // ✅ 자기 자신에게 요청 불가
    public static FriendRequestResponseDto cannotAddSelf() {
        return FriendRequestResponseDto.builder()
                .code("CANNOT_ADD_SELF")
                .message("You cannot send a friend request to yourself.")
                .httpStatus(HttpStatus.BAD_REQUEST) // ✅ 400 Bad Request
                .build();
    }

    // ✅ 인증 오류
    public static FriendRequestResponseDto unauthorized() {
        return FriendRequestResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .httpStatus(HttpStatus.UNAUTHORIZED) // ✅ 401 Unauthorized
                .build();
    }

    // ✅ 서버 오류
    public static FriendRequestResponseDto serverError() {
        return FriendRequestResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR) // ✅ 500 Internal Server Error
                .build();
    }
}
