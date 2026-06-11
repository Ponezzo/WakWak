package com.social.bottle.dto.response;

import lombok.*;
import org.springframework.http.HttpStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeleteBottleCommentResponseDto {
    private String code;
    private String message;
    private HttpStatus httpStatus;
    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer commentId;
    }

    // ✅ 성공 응답
    public static DeleteBottleCommentResponseDto success(Integer commentId) {
        return DeleteBottleCommentResponseDto.builder()
                .code("SUCCESS")
                .message("Comment deleted successfully.")
                .httpStatus(HttpStatus.OK)
                .data(new Data(commentId))
                .build();
    }

    // ✅ 댓글 없음
    public static DeleteBottleCommentResponseDto noComments() {
        return DeleteBottleCommentResponseDto.builder()
                .code("COMMENT_NOT_FOUND")
                .message("The requested comment does not exist.")
                .httpStatus(HttpStatus.NOT_FOUND)
                .build();
    }

    // ✅ 필수 필드 누락
    public static DeleteBottleCommentResponseDto missingFields() {
        return DeleteBottleCommentResponseDto.builder()
                .code("MISSING_REQUIRED_FIELDS")
                .message("bottle_id and comment_id are required.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    // ✅ 존재하지 않는 댓글
    public static DeleteBottleCommentResponseDto commentNotFound() {
        return DeleteBottleCommentResponseDto.builder()
                .code("COMMENT_NOT_FOUND")
                .message("The requested comment does not exist.")
                .httpStatus(HttpStatus.NOT_FOUND)
                .build();
    }

    // ✅ 삭제 권한 없음 (유리병 작성자가 아님)
    public static DeleteBottleCommentResponseDto notBottleOwner() {
        return DeleteBottleCommentResponseDto.builder()
                .code("NOT_BOTTLE_OWNER")
                .message("Only the bottle owner can delete comments.")
                .httpStatus(HttpStatus.FORBIDDEN)
                .build();
    }

    // ✅ 인증 실패 (토큰 없음)
    public static DeleteBottleCommentResponseDto authRequired() {
        return DeleteBottleCommentResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }

    // ✅ 유효하지 않은 토큰
    public static DeleteBottleCommentResponseDto invalidToken() {
        return DeleteBottleCommentResponseDto.builder()
                .code("INVALID_TOKEN")
                .message("The provided token is invalid or expired.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }

    // ✅ 서버 내부 오류
    public static DeleteBottleCommentResponseDto internalServerError() {
        return DeleteBottleCommentResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                .build();
    }
}
