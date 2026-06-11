package com.social.stardiary.service;

import com.social.stardiary.dto.request.CreateStarDiaryRequestDto;
import com.social.stardiary.dto.response.CreateStarDiaryResponseDto;
import com.social.stardiary.dto.response.DeleteStarDiaryResponseDto;
import com.social.stardiary.dto.response.GetStarDiaryResponseDto;

public interface StarDiaryService {
    CreateStarDiaryResponseDto createStarDiary(CreateStarDiaryRequestDto requestDto);

    GetStarDiaryResponseDto getStarDiaryByStarId(Integer starId);

    void checkOwnership(Integer userId, Integer starId); // ✅ 사용자 소유권 검증 추가

    DeleteStarDiaryResponseDto deleteStarDiary(Integer userId, Integer starId);

}
