package com.social.stardiary.controller;

import com.social.login.provider.JWTProvider;
import com.social.login.util.UserContext;
import com.social.stardiary.dto.request.CreateStarDiaryRequestDto;
import com.social.stardiary.dto.request.DeleteStarDiaryRequestDto;
import com.social.stardiary.dto.request.GetStarDiaryRequestDto;
import com.social.stardiary.dto.response.CreateStarDiaryResponseDto;
import com.social.stardiary.dto.response.DeleteStarDiaryResponseDto;
import com.social.stardiary.dto.response.GetStarDiaryResponseDto;
import com.social.stardiary.service.StarDiaryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/star-diary")
@RequiredArgsConstructor
public class StarDiaryController {

    private final StarDiaryService starDiaryService;

    @PostMapping
    public ResponseEntity<CreateStarDiaryResponseDto> createStarDiary(
            HttpServletRequest request,
            @ModelAttribute @Valid CreateStarDiaryRequestDto requestDto) {
        return ResponseEntity.ok(starDiaryService.createStarDiary(requestDto));
    }

    @PostMapping("/detail")
    public ResponseEntity<GetStarDiaryResponseDto> getStarDiary(
            HttpServletRequest request,
            @RequestBody @Valid GetStarDiaryRequestDto requestDto) { // ✅ starId를 JSON Body에서 받음
        Integer userId = UserContext.getUserId(request);
        starDiaryService.checkOwnership(userId,requestDto.getStarId());

        return ResponseEntity.ok(starDiaryService.getStarDiaryByStarId(requestDto.getStarId()));
    }

    @PostMapping("/delete")
    public ResponseEntity<DeleteStarDiaryResponseDto> deleteStarDiary(
            HttpServletRequest request,
            @RequestBody @Valid DeleteStarDiaryRequestDto requestDto) {
        Integer userId = UserContext.getUserId(request);

        return ResponseEntity.ok(starDiaryService.deleteStarDiary(userId, requestDto.getStarId()));
    }
}
