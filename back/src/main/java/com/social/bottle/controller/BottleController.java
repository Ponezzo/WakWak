package com.social.bottle.controller;

import com.social.bottle.dto.request.*;
import com.social.bottle.dto.response.*;
import com.social.bottle.dto.response.BottleLikeCountResponseDto;
import com.social.bottle.service.BottleService;
import com.social.login.util.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bottle")
@RequiredArgsConstructor
@Slf4j
public class BottleController {

    private final BottleService bottleService;

    @PostMapping
    public ResponseEntity<CreateMessageResponseDto> createMessage(
            HttpServletRequest request,
            @ModelAttribute @Valid CreateMessageRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);

        int mediaCount = (requestDto.getMedia() != null) ? requestDto.getMedia().size() : 0;
        log.info("📌 [유리병 작성 시작] 제목={}, 내용 길이={}, 첨부파일 수={}",
                requestDto.getTitle(), requestDto.getContent().length(), mediaCount);

        CreateMessageResponseDto response = bottleService.createMessage(userId, requestDto);

        if ("SUCCESS".equals(response.getCode())) {
            log.info("✅ [유리병 작성 성공] bottleId={}, title={}",
                    response.getData().getBottleId(), response.getData().getTitle());
            return ResponseEntity.status(201).body(response);
        } else {
            log.warn("❌ [유리병 작성 실패] 이유: {}", response.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @GetMapping("/random")
    public ResponseEntity<RandomBottleResponseDto> getRandomBottle(
            HttpServletRequest request) {

        Integer userId = UserContext.getUserId(request);

        RandomBottleResponseDto response = bottleService.getRandomBottle(userId);

        if ("SUCCESS".equals(response.getCode())) {
            log.info("✅ [랜덤 유리병 조회 성공] bottleId={}", response.getData().getBottleId());
            return ResponseEntity.ok(response);
        } else {
            log.warn("❌ [랜덤 유리병 조회 실패] 이유: {}", response.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/list")
    public ResponseEntity<BottleListResponseDto> getExpiredBottles(
            HttpServletRequest request) {

        Integer userId = UserContext.getUserId(request);
        BottleListResponseDto response = bottleService.getExpiredBottles(userId);

        if ("SUCCESS".equals(response.getCode())) {
            log.info("✅ [유리병 전체 조회 성공] 유리병 개수={}", response.getData().size());
            return ResponseEntity.status(200).body(response);
        } else {
            log.warn("❌ [유리병 전체 조회 실패] 이유: {}", response.getMessage());
            return ResponseEntity.status(response.getHttpStatus()).body(response);
        }
    }

    @GetMapping("/detail")
    public ResponseEntity<BottleDetailResponseDto> getBottleDetails(
            HttpServletRequest request,
            @Valid @ModelAttribute BottleRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);

        BottleDetailResponseDto response = bottleService.getBottleDetails(userId, requestDto.getBottleId());

        if ("SUCCESS".equals(response.getCode())) {
            log.info("✅ [유리병 상세 조회 성공] bottle_id={}", response.getData().getBottleId());
            return ResponseEntity.status(200).body(response);
        } else {
            log.warn("❌ [유리병 상세 조회 실패] 이유: {}", response.getMessage());
            return ResponseEntity.status(response.getHttpStatus()).body(response);
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<BottleDeleteResponseDto> deleteBottle(
            HttpServletRequest request,
            @Valid @RequestBody BottleRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);

        BottleDeleteResponseDto response = bottleService.deleteBottle(userId, requestDto.getBottleId());

        if ("SUCCESS".equals(response.getCode())) {
            log.info("✅ [유리병 삭제 성공] bottle_id={}", requestDto.getBottleId());
            return ResponseEntity.status(200).body(response);
        } else {
            log.warn("❌ [유리병 삭제 실패] 이유: {}", response.getMessage());
            return ResponseEntity.status(response.getHttpStatus()).body(response);
        }
    }

    @PostMapping("/like")
    public ResponseEntity<BottleLikeResponseDto> likeBottle(
            HttpServletRequest request,
            @Valid @RequestBody BottleRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);
        BottleLikeResponseDto response = bottleService.likeBottle(userId, requestDto.getBottleId());
        return ResponseEntity.status(response.getHttpStatus()).body(response);
    }

    @PostMapping("/like/delete")
    public ResponseEntity<BottleLikeResponseDto> removeLike(
            HttpServletRequest request,
            @Valid @RequestBody BottleRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);
        BottleLikeResponseDto response = bottleService.removeLike(userId, requestDto.getBottleId());
        return ResponseEntity.status(response.getHttpStatus()).body(response);
    }

    @GetMapping("/like/count")
    public ResponseEntity<BottleLikeCountResponseDto> getLikeCount(
            HttpServletRequest request,
            @Valid @ModelAttribute BottleRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);
        BottleLikeCountResponseDto response = bottleService.getLikeCount(userId, requestDto.getBottleId());
        return ResponseEntity.status(response.getHttpStatus()).body(response);
    }

    @GetMapping("/like/status")
    public ResponseEntity<BottleLikeStatusResponseDto> getLikeStatus(
            HttpServletRequest request,
            @Valid @ModelAttribute BottleRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);
        BottleLikeStatusResponseDto response = bottleService.getLikeStatus(userId, requestDto.getBottleId());

        log.info("✅ [좋아요 상태 조회 완료] 유리병 ID: {}, 상태: {}", response.getData().getBottleId(), response.getData().getStatus());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/past")
    public ResponseEntity<CreateMessageResponseDto> createPastMessage(
            HttpServletRequest request,
            @ModelAttribute @Valid CreateMessageRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);

        int mediaCount = (requestDto.getMedia() != null) ? requestDto.getMedia().size() : 0;
        log.info("📌 [유리병 작성 시작] 제목={}, 내용 길이={}, 첨부파일 수={}",
                requestDto.getTitle(), requestDto.getContent().length(), mediaCount);

        CreateMessageResponseDto response = bottleService.createPastMessage(userId, requestDto);

        if ("SUCCESS".equals(response.getCode())) {
            log.info("✅ [유리병 작성 성공] bottleId={}, title={}",
                    response.getData().getBottleId(), response.getData().getTitle());
            return ResponseEntity.status(201).body(response);
        } else {
            log.warn("❌ [유리병 작성 실패] 이유: {}", response.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }
}
