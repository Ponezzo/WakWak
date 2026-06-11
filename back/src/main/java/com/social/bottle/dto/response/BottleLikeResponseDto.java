package com.social.bottle.dto.response;

import lombok.*;
import org.springframework.http.HttpStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BottleLikeResponseDto {
    private String code;
    private String message;
    private HttpStatus httpStatus;

    // ✅ 성공 응답 (200 OK)
    public static BottleLikeResponseDto success() {
        return BottleLikeResponseDto.builder()
                .code("SUCCESS")
                .message("Like added successfully.")
                .httpStatus(HttpStatus.OK)
                .build();
    }

    // ✅ 이미 좋아요를 누른 경우 (400 Bad Request)
    public static BottleLikeResponseDto alreadyLiked() {
        return BottleLikeResponseDto.builder()
                .code("ALREADY_LIKED")
                .message("You have already liked this bottle.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    // ✅ 좋아요를 누르지 않은 경우 (400 Bad Request)
    public static BottleLikeResponseDto notLiked() {
        return BottleLikeResponseDto.builder()
                .code("NOT_LIKED")
                .message("You have not liked this bottle.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    // ✅ 존재하지 않는 유리병 (404 Not Found)
    public static BottleLikeResponseDto bottleNotFound() {
        return BottleLikeResponseDto.builder()
                .code("BOTTLE_NOT_FOUND")
                .message("The requested bottle does not exist.")
                .httpStatus(HttpStatus.NOT_FOUND)
                .build();
    }

    // ✅ 필수 필드 없음 (400 Bad Request)
    public static BottleLikeResponseDto missingBottleId() {
        return BottleLikeResponseDto.builder()
                .code("MISSING_BOTTLE_ID")
                .message("Bottle ID is required.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    // ✅ 인증 오류 (401 Unauthorized)
    public static BottleLikeResponseDto unauthorized() {
        return BottleLikeResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }
}
