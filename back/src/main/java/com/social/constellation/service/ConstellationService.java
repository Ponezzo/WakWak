package com.social.constellation.service;

import com.social.constellation.dto.request.CreateConstellationRequestDto;
import com.social.constellation.dto.request.DeleteConstellationRequestDto;
import com.social.constellation.dto.request.GetConstellationNameRequestDto;
import com.social.constellation.dto.response.CreateConstellationResponseDto;
import com.social.constellation.dto.response.DeleteConstellationResponseDto;
import com.social.constellation.dto.response.GetConstellationNameResponseDto;

public interface ConstellationService {
    CreateConstellationResponseDto createConstellation(Integer userId, CreateConstellationRequestDto requestDto);
    GetConstellationNameResponseDto getConstellationName(GetConstellationNameRequestDto requestDto);
    DeleteConstellationResponseDto deleteConstellation(Integer userId, DeleteConstellationRequestDto requestDto);
}