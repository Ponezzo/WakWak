package com.social.friends.dto.response;

import com.social.friends.dto.FriendProjection;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetFriendsResponseDto {
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
        private String mediaUrl; // ✅ profileImage → mediaUrl 변경
    }

    public static GetFriendsResponseDto success(List<FriendProjection> friends) {
        return GetFriendsResponseDto.builder()
                .code("SUCCESS")
                .message("Friends list retrieved successfully.")
                .data(friends.stream().map(friend ->
                                new Data(friend.getUserId(), friend.getNickname(), friend.getMediaUrl()))
                        .collect(Collectors.toList()))
                .build();
    }

    public static GetFriendsResponseDto noFriends() {
        return GetFriendsResponseDto.builder()
                .code("SUCCESS")
                .message("No friends found.")
                .data(List.of())
                .build();
    }

    public static GetFriendsResponseDto unauthorized() {
        return GetFriendsResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }
}
