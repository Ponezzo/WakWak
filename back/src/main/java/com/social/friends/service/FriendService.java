package com.social.friends.service;

import com.social.friends.dto.request.FriendAcceptRequestDto;
import com.social.friends.dto.request.FriendDeleteRequestDto;
import com.social.friends.dto.request.FriendRejectRequestDto;
import com.social.friends.dto.request.FriendRequestDto;
import com.social.friends.dto.response.*;

import java.util.List;

public interface FriendService {
    FriendRequestResponseDto sendFriendRequest(Integer userId, Integer receiverId);

    FriendRequestListResponseDto getFriendRequests(Integer userId);

    FriendAcceptResponseDto acceptFriendRequest(Integer userId, Integer senderId);

    FriendRejectResponseDto rejectFriendRequest(Integer userId, Integer senderId);

    GetFriendsResponseDto getFriends(Integer userId);

    FriendDeleteResponseDto deleteFriend(Integer userId, Integer frinedId);

    FriendSearchResponseDto searchFriends(Integer userId, String nickname);

    SearchFriendStatusResponseDto getFriendStatus(Integer userId, Integer targetId);

    RecommendFriendResponseDto recommendFriends(Integer userId);

    BluetoothSearchResponseDto searchNearbyUsers(Integer userId, List<String> deviceIds);
}
