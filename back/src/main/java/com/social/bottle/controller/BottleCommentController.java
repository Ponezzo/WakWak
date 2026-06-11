package com.social.bottle.controller;

import com.social.bottle.dto.request.BottleCommentRequestDto;
import com.social.bottle.dto.request.DeleteBottleCommentRequestDto;
import com.social.bottle.dto.response.BottleCommentResponseDto;
import com.social.bottle.dto.response.DeleteBottleCommentResponseDto;
import com.social.bottle.dto.response.GetBottleCommentResponseDto;
import com.social.bottle.service.BottleCommentService;
import com.social.login.util.UserContext;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bottle/comments")
@RequiredArgsConstructor
@Slf4j
public class BottleCommentController {

    private final BottleCommentService bottleCommentService;

    /**
     * ✅ 유리병 댓글 및 대댓글 작성 API
     */
    @PostMapping
    public ResponseEntity<BottleCommentResponseDto> addComment(
            HttpServletRequest request,
            @Valid @RequestBody BottleCommentRequestDto requestDto) {

        Integer userId = UserContext.getUserId(request);
        log.info("📌 [댓글 작성 요청] bottle_id={}, parent_id={}, content={}",
                requestDto.getBottleId(), requestDto.getParentId(), requestDto.getContent());

        BottleCommentResponseDto response = bottleCommentService.addComment(userId, requestDto);

        log.info("📌 [댓글 작성 결과] status={}, message={}",
                response.getHttpStatus(), response.getMessage());

        return ResponseEntity.status(response.getHttpStatus()).body(response);
    }

    @GetMapping
    public ResponseEntity<GetBottleCommentResponseDto> getComments(
            HttpServletRequest request,
            @RequestParam Integer bottleId) {

        Integer userId = UserContext.getUserId(request);
        log.info("[댓글 조회 요청] bottle_id={}", bottleId);
        GetBottleCommentResponseDto response = bottleCommentService.getComments(userId, bottleId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/delete")
    public ResponseEntity<DeleteBottleCommentResponseDto> deleteComment(
            HttpServletRequest request,
            @Valid @RequestBody DeleteBottleCommentRequestDto requestDto) {
        log.info("🗑️ Received delete request for comment: {}", requestDto.getCommentId());

        Integer userId = UserContext.getUserId(request);
        log.info("[댓글 삭제 요청] comment_id={}", requestDto.getCommentId());

        DeleteBottleCommentResponseDto response = bottleCommentService.deleteComment(userId, requestDto);
        return ResponseEntity.status(response.getHttpStatus()).body(response);
    }
}
