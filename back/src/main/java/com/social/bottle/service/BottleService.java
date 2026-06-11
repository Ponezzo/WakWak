package com.social.bottle.service;

import com.social.bottle.dto.request.CreateMessageRequestDto;
import com.social.bottle.dto.response.*;

public interface BottleService {
    CreateMessageResponseDto createMessage(Integer userId, CreateMessageRequestDto request);

    RandomBottleResponseDto getRandomBottle(Integer userId);

    BottleListResponseDto getExpiredBottles(Integer userId);

    BottleDetailResponseDto getBottleDetails(Integer userId, Integer bottleId);

    BottleDeleteResponseDto deleteBottle(Integer userId, Integer bottleId);

    BottleLikeResponseDto likeBottle(Integer userId, Integer bottleId);

    BottleLikeResponseDto removeLike(Integer userId, Integer bottleId);

    BottleLikeCountResponseDto getLikeCount(Integer userId, Integer bottleId);

    BottleLikeStatusResponseDto getLikeStatus(Integer userId, Integer bottleId);

    CreateMessageResponseDto createPastMessage(Integer userId, CreateMessageRequestDto request);
}
