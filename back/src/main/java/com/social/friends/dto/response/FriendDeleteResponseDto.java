package com.social.friends.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendDeleteResponseDto {
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
        private Integer deletedFriendId;
    }

    // ✅ 친구 삭제 성공
    public static FriendDeleteResponseDto success(Integer userId, Integer friendId) {
        return FriendDeleteResponseDto.builder()
                .code("SUCCESS")
                .message("Friend deleted successfully.")
                .data(new Data(userId, friendId))
                .build();
    }

    // ✅ 필수 필드 누락
    public static FriendDeleteResponseDto missingFriendId() {
        return FriendDeleteResponseDto.builder()
                .code("MISSING_FRIEND_ID")
                .message("Friend ID is required.")
                .build();
    }

    // ✅ 친구 관계가 존재하지 않음
    public static FriendDeleteResponseDto friendNotFound() {
        return FriendDeleteResponseDto.builder()
                .code("FRIEND_NOT_FOUND")
                .message("Friend relationship does not exist.")
                .build();
    }

    // ✅ 자기 자신 삭제 불가
    public static FriendDeleteResponseDto cannotDeleteSelf() {
        return FriendDeleteResponseDto.builder()
                .code("CANNOT_DELETE_SELF")
                .message("You cannot delete yourself as a friend.")
                .build();
    }

    // ✅ 인증 오류
    public static FriendDeleteResponseDto unauthorized() {
        return FriendDeleteResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }

    // ✅ 서버 오류
    public static FriendDeleteResponseDto serverError() {
        return FriendDeleteResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .build();
    }
}
