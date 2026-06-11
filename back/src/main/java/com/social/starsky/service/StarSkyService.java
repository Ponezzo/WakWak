package com.social.starsky.service;

import com.social.starsky.dto.request.GetStarSkyConstellationsRequestDto;
import com.social.starsky.dto.request.GetStarSkyEquipRequestDto;
import com.social.starsky.dto.request.GetStarsBySkyRequestDto;
import com.social.starsky.dto.response.*;
import org.springframework.http.ResponseEntity;

public interface StarSkyService {
    public Integer getMinStarskyIdByUserId(Integer userId);

    public GetStarSkyListResponseDto getUserStarSkyList(Integer userId);

    public GetStarSkyResponseDto getUserStarSky(Integer userId);

    GetStarsBySkyResponseDto getStarsBySky(Integer userId, GetStarsBySkyRequestDto requestDto);

    GetStarSkyConstellationsResponseDto getConstellationsBySky(Integer userId, GetStarSkyConstellationsRequestDto requestDto);

    public ResponseEntity<GetStarSkyEquipResponseDto> equipStarSky(Integer userId, GetStarSkyEquipRequestDto requestDto);

}
