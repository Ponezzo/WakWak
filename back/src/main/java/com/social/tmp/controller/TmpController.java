package com.social.tmp.controller;

import com.social.login.dto.request.NicknameUpdateRequestDto;
import com.social.login.dto.request.RegisterDeviceRequestDto;
import com.social.login.dto.response.auth.GetUserResponseDto;
import com.social.login.dto.response.auth.NicknameUpdateResponseDto;
import com.social.login.dto.response.auth.ProfileImageUpdateResponseDto;
import com.social.login.dto.response.auth.RegisterDeviceResponseDto;
import com.social.login.service.AuthService;
import com.social.login.util.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/tmp")
@RequiredArgsConstructor
public class TmpController {

    private final AuthService authService;

    @GetMapping
    public ResponseEntity<GetUserResponseDto> getUserProfile(HttpServletRequest request) {
        log.info("📌 [회원정보 조회 요청]");
        Integer userId = UserContext.getUserId(request);
        GetUserResponseDto response = authService.getUserProfile(userId);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/nickname")
    public ResponseEntity<NicknameUpdateResponseDto> updateNickname(
            HttpServletRequest request,
            @RequestBody @Valid NicknameUpdateRequestDto requestDto) {

        log.info("📌 [닉네임 변경 API 호출] 새로운 닉네임: {}", requestDto.getNickname());

        Integer userId = UserContext.getUserId(request);
        NicknameUpdateResponseDto response = authService.updateNickname(userId, requestDto.getNickname());
        return ResponseEntity.status(response.getHttpStatus()).body(response);
    }

    @PatchMapping("/profile-image")
    public ResponseEntity<ProfileImageUpdateResponseDto> updateProfileImage(
            HttpServletRequest request,
            @RequestParam("profile_image") MultipartFile file) {

        log.info("📌 [프로필 이미지 변경 API 호출] 파일 크기: {} bytes", file.getSize());
        Integer userId = UserContext.getUserId(request);

        ProfileImageUpdateResponseDto response = authService.updateProfileImage(userId, file);
        return ResponseEntity.status(response.getHttpStatus()).body(response);
    }

    @PostMapping("/device")
    public ResponseEntity<RegisterDeviceResponseDto> registerDevice(
            HttpServletRequest request,
            @RequestBody RegisterDeviceRequestDto requestDto) {

        log.info("📌 [디바이스 등록 요청] Device ID: {}, Device Name: {}", requestDto.getDeviceId(), requestDto.getDeviceName());
        Integer userId = UserContext.getUserId(request);
        RegisterDeviceResponseDto response = authService.registerDevice(userId, requestDto);

        log.info("✅ [디바이스 등록 완료] Device ID: {}, User ID: {}", response.getData().getDeviceId(), response.getData().getUserId());

        return ResponseEntity.ok(response);
    }
}
