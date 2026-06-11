package com.social.bottle.dto.response;

import lombok.*;
import org.springframework.http.HttpStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BottleLikeCountResponseDto {
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
        private Integer bottleId;
        private Integer likeCount;
    }

    // ✅ 성공 응답 (좋아요 개수 반환)
    public static BottleLikeCountResponseDto success(Integer bottleId, Integer likeCount) {
        return BottleLikeCountResponseDto.builder()
                .code("SUCCESS")
                .message("Like count retrieved successfully.")
                .httpStatus(HttpStatus.OK)
                .data(new Data(bottleId, likeCount))
                .build();
    }

    // ✅ 좋아요가 없는 경우 (0개)
    public static BottleLikeCountResponseDto noLikes(Integer bottleId) {
        return BottleLikeCountResponseDto.builder()
                .code("SUCCESS")
                .message("No likes found for this bottle.")
                .httpStatus(HttpStatus.OK)
                .data(new Data(bottleId, 0))
                .build();
    }

    // ✅ 존재하지 않는 유리병 (404 Not Found)
    public static BottleLikeCountResponseDto bottleNotFound() {
        return BottleLikeCountResponseDto.builder()
                .code("BOTTLE_NOT_FOUND")
                .message("The requested bottle does not exist.")
                .httpStatus(HttpStatus.NOT_FOUND)
                .build();
    }

    // ✅ 필수 필드 없음 (400 Bad Request)
    public static BottleLikeCountResponseDto missingBottleId() {
        return BottleLikeCountResponseDto.builder()
                .code("MISSING_BOTTLE_ID")
                .message("Bottle ID is required.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    // ✅ 인증 오류 (401 Unauthorized)
    public static BottleLikeCountResponseDto unauthorized() {
        return BottleLikeCountResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }
}
