package com.social.friends.controller;

import com.social.friends.dto.request.*;
import com.social.friends.dto.response.*;
import com.social.friends.service.FriendService;
import com.social.login.util.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
@Slf4j
public class FriendController {

    private final FriendService friendService;

    @PostMapping("/send")
    public ResponseEntity<FriendRequestResponseDto> sendFriendRequest(
            HttpServletRequest request,
            @Valid @RequestBody FriendRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);

        log.info("📌 [친구 요청 시작] 요청 데이터: receiverId={}", requestDto.getReceiverId());

        FriendRequestResponseDto response = friendService.sendFriendRequest(userId, requestDto.getReceiverId());

        if ("SUCCESS".equals(response.getCode())) {
            log.info("✅ [친구 요청 성공] senderId={}, receiverId={}", response.getData().getSenderId(), response.getData().getReceiverId());
        } else {
            log.warn("❌ [친구 요청 실패] 이유: {}", response.getMessage());
        }

        return ResponseEntity.status(response.getHttpStatus()).body(response); // ✅ 수정된 부분
    }

    @GetMapping("/requests")
    public ResponseEntity<FriendRequestListResponseDto> getFriendRequests(
            HttpServletRequest request) {

        log.info("📌 [GET /friends/requests] 친구 요청 조회 API 호출");

        Integer userId = UserContext.getUserId(request);

        FriendRequestListResponseDto response = friendService.getFriendRequests(userId);

        log.info("✅ [친구 요청 조회 완료] code={}, message={}", response.getCode(), response.getMessage());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/requests/accept")
    public ResponseEntity<FriendAcceptResponseDto> acceptFriendRequest(
            HttpServletRequest request,
            @RequestBody @Valid FriendAcceptRequestDto requestDto) {
        Integer userId = UserContext.getUserId(request);
        FriendAcceptResponseDto response = friendService.acceptFriendRequest(userId, requestDto.getSenderId());
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/requests/reject")
    public ResponseEntity<FriendRejectResponseDto> rejectFriendRequest(
            HttpServletRequest request,
            @RequestBody @Valid FriendRejectRequestDto requestDto) {
        Integer userId = UserContext.getUserId(request);
        FriendRejectResponseDto response = friendService.rejectFriendRequest(userId, requestDto.getSenderId());
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping
    public ResponseEntity<GetFriendsResponseDto> getFriends(
            HttpServletRequest request) {

        Integer userId = UserContext.getUserId(request);

        GetFriendsResponseDto response = friendService.getFriends(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/delete")
    public ResponseEntity<FriendDeleteResponseDto> deleteFriend(
            HttpServletRequest request,
            @RequestBody @Valid FriendDeleteRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);

        log.info("📌 [친구 삭제 요청] friendId={}", requestDto.getFriendId());

        FriendDeleteResponseDto response = friendService.deleteFriend(userId, requestDto.getFriendId());

        if ("SUCCESS".equals(response.getCode())) {
            log.info("✅ [친구 삭제 성공] userId={}, deletedFriendId={}",
                    response.getData().getUserId(), response.getData().getDeletedFriendId());
            return ResponseEntity.ok(response);
        } else {
            log.warn("❌ [친구 삭제 실패] 이유: {}", response.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<FriendSearchResponseDto> searchFriends(
            HttpServletRequest request,
            @Valid @ModelAttribute FriendSearchRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);

        FriendSearchResponseDto response = friendService.searchFriends(userId, requestDto.getNickname());

        if ("SUCCESS".equals(response.getCode())) {
            log.info("✅ [친구 검색 성공] 검색어: {}, 결과 수: {}", requestDto.getNickname(), response.getData().size());
            return ResponseEntity.ok(response);
        } else {
            log.warn("❌ [친구 검색 실패] 이유: {}", response.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }
    @GetMapping("/search/status")
    public ResponseEntity<SearchFriendStatusResponseDto> getFriendStatus(
            HttpServletRequest request,
            @ModelAttribute @Valid SearchFriendStatusRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);
        SearchFriendStatusResponseDto response = friendService.getFriendStatus(userId, requestDto.getTargetId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/recommend-friend")
    public ResponseEntity<RecommendFriendResponseDto> recommendFriends(
            HttpServletRequest request) {

        Integer userId = UserContext.getUserId(request);
        RecommendFriendResponseDto response = friendService.recommendFriends(userId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/search/bluetooth")
    public ResponseEntity<BluetoothSearchResponseDto> searchUsersByBluetooth(
            HttpServletRequest request,
            @RequestBody @Valid BluetoothSearchRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);
        BluetoothSearchResponseDto response = friendService.searchNearbyUsers(userId, requestDto.getDeviceIds());

        return ResponseEntity.status(response.getHttpStatus()).body(response);
    }


}
