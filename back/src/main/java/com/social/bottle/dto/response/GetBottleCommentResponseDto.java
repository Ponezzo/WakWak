package com.social.bottle.dto.response;

import lombok.*;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetBottleCommentResponseDto {
    private String code;
    private String message;
    private HttpStatus httpStatus;
    private List<Data> data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer commentId;
        private Integer bottleId;
        private Integer userId;
        private String nickname; // ✅ 닉네임 추가
        private Integer parentId;
        private String content;
        private Instant createdAt;
        private boolean isDeleted; // ✅ boolean 타입으로 유지
        private Integer depth;
    }

    // ✅ 성공 응답 (댓글 조회 성공)
    public static GetBottleCommentResponseDto success(List<Data> data) {
        return GetBottleCommentResponseDto.builder()
                .code("SUCCESS")
                .message("Comments retrieved successfully.")
                .httpStatus(HttpStatus.OK)
                .data(data)
                .build();
    }

    // ✅ 댓글이 없는 경우
    public static GetBottleCommentResponseDto noComments() {
        return GetBottleCommentResponseDto.builder()
                .code("SUCCESS")
                .message("No comments found for this bottle.")
                .httpStatus(HttpStatus.OK)
                .data(List.of()) // ✅ 빈 배열 반환
                .build();
    }

    // ✅ 필수 필드 누락
    public static GetBottleCommentResponseDto missingBottleId() {
        return GetBottleCommentResponseDto.builder()
                .code("MISSING_BOTTLE_ID")
                .message("Bottle ID is required.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    // ✅ 존재하지 않는 유리병
    public static GetBottleCommentResponseDto bottleNotFound() {
        return GetBottleCommentResponseDto.builder()
                .code("BOTTLE_NOT_FOUND")
                .message("The requested bottle does not exist.")
                .httpStatus(HttpStatus.NOT_FOUND)
                .build();
    }

    // ✅ 인증 실패 (토큰 없음)
    public static GetBottleCommentResponseDto authRequired() {
        return GetBottleCommentResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }

    // ✅ 유효하지 않은 토큰
    public static GetBottleCommentResponseDto invalidToken() {
        return GetBottleCommentResponseDto.builder()
                .code("INVALID_TOKEN")
                .message("The provided token is invalid or expired.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }

    // ✅ 서버 내부 오류
    public static GetBottleCommentResponseDto internalServerError() {
        return GetBottleCommentResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                .build();
    }
}
