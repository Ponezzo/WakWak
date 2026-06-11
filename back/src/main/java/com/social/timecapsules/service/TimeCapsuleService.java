package com.social.timecapsules.service;

import com.social.timecapsules.dto.request.CreateTimeCapsuleRequestDto;
import com.social.timecapsules.dto.request.GetTimeCapsuleMapRequestDto;
import com.social.timecapsules.dto.request.TimeCapsuleRequestDto;
import com.social.timecapsules.dto.response.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TimeCapsuleService {
    public CreateTimeCapsuleResponseDto createTimeCapsule(Integer userId, CreateTimeCapsuleRequestDto request, List<MultipartFile> files);

    public GetTimeCapsuleMapResponseDto getTimeCapsulesOnMap(Integer userId, GetTimeCapsuleMapRequestDto request);

    GetTimeCapsuleMapListResponseDto getAccessibleTimeCapsules(Integer userId);

    TimeCapsuleDetailResponseDto getTimeCapsuleDetail(Integer userId, Integer capsuleId);

    TimeCapsuleDeleteResponseDto deleteTimeCapsule(Integer userId, Integer capsuleId);

    TimeCapsuleCollectResponseDto collectTimeCapsules(Integer userId);

    public CreateTimeCapsuleResponseDto createPastTimeCapsule(Integer userId, CreateTimeCapsuleRequestDto request, List<MultipartFile> files);

}