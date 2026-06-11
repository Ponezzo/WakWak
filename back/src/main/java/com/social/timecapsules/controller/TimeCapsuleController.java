package com.social.timecapsules.controller;

import com.social.login.util.UserContext;
import com.social.timecapsules.dto.request.CreateTimeCapsuleRequestDto;
import com.social.timecapsules.dto.request.GetTimeCapsuleMapRequestDto;
import com.social.timecapsules.dto.request.TimeCapsuleRequestDto;
import com.social.timecapsules.dto.response.*;
import com.social.timecapsules.service.TimeCapsuleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/time-capsules")
@RequiredArgsConstructor
public class TimeCapsuleController {

    private final TimeCapsuleService timeCapsuleService;

    @PostMapping
    public ResponseEntity<CreateTimeCapsuleResponseDto> createTimeCapsule(
            HttpServletRequest request,
            @Valid @ModelAttribute CreateTimeCapsuleRequestDto requestDto,
            @RequestPart(name = "files", required = false) List<MultipartFile> files) {

        log.info("🔹 [Controller] 타임캡슐 생성 요청: title={}, openedAt={}, latitude={}, longitude={}",
                requestDto.getTitle(), requestDto.getOpenedAt(), requestDto.getLatitude(), requestDto.getLongitude());

        Integer userId = UserContext.getUserId(request);
        CreateTimeCapsuleResponseDto response = timeCapsuleService.createTimeCapsule(userId, requestDto, files);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/map")
    public ResponseEntity<GetTimeCapsuleMapResponseDto> getTimeCapsulesOnMap(
            HttpServletRequest request,
            @Valid GetTimeCapsuleMapRequestDto requestDto
    ) {
        log.info("🔹 [Controller] /time-capsules/map GET 요청 - 좌표 범위: left={}, right={}, up={}, down={}",
                requestDto.getLeft(), requestDto.getRight(), requestDto.getUp(), requestDto.getDown());

        Integer userId = UserContext.getUserId(request);
        GetTimeCapsuleMapResponseDto response = timeCapsuleService.getTimeCapsulesOnMap(userId, requestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/map/list")
    public ResponseEntity<GetTimeCapsuleMapListResponseDto> getTimeCapsules(
            HttpServletRequest request) {

        log.info("📌 [타임캡슐 지도 조회 API 호출]");

        Integer userId = UserContext.getUserId(request);
        GetTimeCapsuleMapListResponseDto response = timeCapsuleService.getAccessibleTimeCapsules(userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<TimeCapsuleDetailResponseDto> getTimeCapsuleDetail(
            HttpServletRequest request,
            @Valid @ModelAttribute TimeCapsuleRequestDto requestDto) {

        log.info("📌 [타임캡슐 상세 조회 API 호출] capsuleId={}", requestDto.getCapsuleId());

        Integer userId = UserContext.getUserId(request);
        TimeCapsuleDetailResponseDto response = timeCapsuleService.getTimeCapsuleDetail(userId, requestDto.getCapsuleId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/delete")
    public ResponseEntity<TimeCapsuleDeleteResponseDto> deleteTimeCapsule(
            HttpServletRequest request,
            @Valid @RequestBody TimeCapsuleRequestDto requestDto) {

        log.info("📌 [타임캡슐 삭제 API 호출]");

        Integer userId = UserContext.getUserId(request);
        TimeCapsuleDeleteResponseDto response = timeCapsuleService.deleteTimeCapsule(userId, requestDto.getCapsuleId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/map/collect")
    public ResponseEntity<TimeCapsuleCollectResponseDto> collectTimeCapsules(
            HttpServletRequest request) {

        Integer userId = UserContext.getUserId(request);
        TimeCapsuleCollectResponseDto response = timeCapsuleService.collectTimeCapsules(userId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/past")
    public ResponseEntity<CreateTimeCapsuleResponseDto> createPastTimeCapsule(
            HttpServletRequest request,
            @Valid @ModelAttribute CreateTimeCapsuleRequestDto requestDto,
            @RequestPart(name = "files", required = false) List<MultipartFile> files) {

        log.info("🔹 [Controller] 타임캡슐 생성 요청: title={}, openedAt={}, latitude={}, longitude={}",
                requestDto.getTitle(), requestDto.getOpenedAt(), requestDto.getLatitude(), requestDto.getLongitude());

        Integer userId = UserContext.getUserId(request);
        CreateTimeCapsuleResponseDto response = timeCapsuleService.createPastTimeCapsule(userId, requestDto, files);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
