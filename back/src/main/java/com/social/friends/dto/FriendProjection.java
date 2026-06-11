package com.social.friends.dto;

public interface FriendProjection {
    Integer getUserId();
    String getNickname();
    String getMediaUrl(); // ✅ profileImage → mediaUrl로 변경
}
