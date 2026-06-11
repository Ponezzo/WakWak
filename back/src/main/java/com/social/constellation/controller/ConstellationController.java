package com.social.constellation.controller;

import com.social.constellation.dto.request.CreateConstellationRequestDto;
import com.social.constellation.dto.request.DeleteConstellationRequestDto;
import com.social.constellation.dto.request.GetConstellationNameRequestDto;
import com.social.constellation.dto.response.CreateConstellationResponseDto;
import com.social.constellation.dto.response.DeleteConstellationResponseDto;
import com.social.constellation.dto.response.GetConstellationNameResponseDto;
import com.social.constellation.service.ConstellationService;
import com.social.login.provider.JWTProvider;
import com.social.login.util.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/constellations")
@RequiredArgsConstructor
public class ConstellationController {

    private final ConstellationService constellationService;
    private final JWTProvider jwtProvider;

    @PostMapping
    public ResponseEntity<CreateConstellationResponseDto> createConstellation(
            HttpServletRequest request,
            @RequestBody @Valid CreateConstellationRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);

        return ResponseEntity.ok(constellationService.createConstellation(userId, requestDto));
    }

    @PostMapping("/name")
    public ResponseEntity<GetConstellationNameResponseDto> getConstellationName(
            HttpServletRequest request,
            @RequestBody @Valid GetConstellationNameRequestDto requestDto) {

        return ResponseEntity.ok(constellationService.getConstellationName(requestDto));
    }

    @PostMapping("/delete")
    public ResponseEntity<DeleteConstellationResponseDto> deleteConstellation(
            HttpServletRequest request,
            @RequestBody @Valid DeleteConstellationRequestDto requestDto) {
        Integer userId = UserContext.getUserId(request);
        return ResponseEntity.ok(constellationService.deleteConstellation(userId, requestDto));
    }
}
