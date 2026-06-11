package com.social.starsky.controller;

import com.social.login.provider.JWTProvider;
import com.social.login.util.UserContext;
import com.social.starsky.dto.request.GetStarSkyConstellationsRequestDto;
import com.social.starsky.dto.request.GetStarSkyEquipRequestDto;
import com.social.starsky.dto.request.GetStarsBySkyRequestDto;
import com.social.starsky.dto.response.*;
import com.social.starsky.service.StarSkyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/star-sky")
@RequiredArgsConstructor
@Slf4j
public class StarSkyController {

    private final StarSkyService starSkyService;

    @GetMapping("/list")
    public ResponseEntity<GetStarSkyListResponseDto> getUserStarSkyList(
            HttpServletRequest request// JWT 토큰을 헤더에서 받음
    ) {

        Integer userId = UserContext.getUserId(request);
        GetStarSkyListResponseDto response = starSkyService.getUserStarSkyList(userId);
        return ResponseEntity.ok(response);
    }
    @GetMapping()
    public ResponseEntity<GetStarSkyResponseDto> getUserStarSky(
            HttpServletRequest request// JWT 토큰을 헤더에서 받음
    ) {
        Integer userId = UserContext.getUserId(request);

        // Service 호출
        GetStarSkyResponseDto response = starSkyService.getUserStarSky(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/star")
    public ResponseEntity<GetStarsBySkyResponseDto> getStarsBySky(
            HttpServletRequest request,
            @RequestBody @Valid GetStarsBySkyRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);
        return ResponseEntity.ok(starSkyService.getStarsBySky(userId, requestDto));
    }

    @PostMapping("/constellations")
    public ResponseEntity<GetStarSkyConstellationsResponseDto> getConstellationsBySky(
            HttpServletRequest request,
            @RequestBody @Valid GetStarSkyConstellationsRequestDto requestDto) {
        Integer userId = UserContext.getUserId(request);

        return ResponseEntity.ok(starSkyService.getConstellationsBySky(userId, requestDto));
    }

    @PostMapping("/equip")
    public ResponseEntity<GetStarSkyEquipResponseDto> equipStarSky(
            HttpServletRequest request,
            @Valid @RequestBody GetStarSkyEquipRequestDto requestDto
    ) {
        Integer userId = UserContext.getUserId(request);
        return starSkyService.equipStarSky(userId, requestDto);
    }
}
