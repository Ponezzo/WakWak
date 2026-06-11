package com.social.bottle.service;

import com.social.bottle.dto.request.BottleCommentRequestDto;
import com.social.bottle.dto.request.DeleteBottleCommentRequestDto;
import com.social.bottle.dto.response.BottleCommentResponseDto;
import com.social.bottle.dto.response.DeleteBottleCommentResponseDto;
import com.social.bottle.dto.response.GetBottleCommentResponseDto;

import java.util.List;

public interface BottleCommentService {
    BottleCommentResponseDto addComment(Integer userId, BottleCommentRequestDto requestDto);

    GetBottleCommentResponseDto getComments(Integer userId, Integer bottleId);

    DeleteBottleCommentResponseDto deleteComment(Integer userId, DeleteBottleCommentRequestDto requestDto);
}
