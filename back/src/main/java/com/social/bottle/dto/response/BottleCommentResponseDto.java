package com.social.bottle.dto.response;

import lombok.*;
import org.springframework.http.HttpStatus;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BottleCommentResponseDto {
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
        private Integer bottleId;
        private Integer userId;
        private Integer parentId;
        private String content;
        private Instant createdAt;
        private Boolean isDeleted;
    }

    public static BottleCommentResponseDto success(Data data) {
        return BottleCommentResponseDto.builder()
                .code("SUCCESS")
                .message("Comment added successfully.")
                .httpStatus(HttpStatus.CREATED)
                .data(data)
                .build();
    }

    public static BottleCommentResponseDto missingFields() {
        return BottleCommentResponseDto.builder()
                .code("MISSING_REQUIRED_FIELDS")
                .message("bottle_id and content are required.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    public static BottleCommentResponseDto invalidContentLength() {
        return BottleCommentResponseDto.builder()
                .code("INVALID_CONTENT_LENGTH")
                .message("Comment content must be between 1 and 255 characters.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    public static BottleCommentResponseDto bottleNotFound() {
        return BottleCommentResponseDto.builder()
                .code("BOTTLE_NOT_FOUND")
                .message("The requested bottle does not exist.")
                .httpStatus(HttpStatus.NOT_FOUND)
                .build();
    }

    public static BottleCommentResponseDto parentCommentNotFound() {
        return BottleCommentResponseDto.builder()
                .code("PARENT_COMMENT_NOT_FOUND")
                .message("The specified parent comment does not exist.")
                .httpStatus(HttpStatus.NOT_FOUND)
                .build();
    }

    public static BottleCommentResponseDto unauthorized() {
        return BottleCommentResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }
}
