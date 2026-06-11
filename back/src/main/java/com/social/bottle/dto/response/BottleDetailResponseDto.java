package com.social.bottle.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BottleDetailResponseDto {
    private String code;
    private String message;
    private Data data;
    @JsonIgnore
    private HttpStatus httpStatus; // ✅ HTTP 상태 코드 추가

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer bottleId;
        private String title;
        private String content;
        private Instant createdAt;
        private List<String> mediaUrls;
        private int likeCount;
    }

    // ✅ 성공 응답
    public static BottleDetailResponseDto success(Integer bottleId,String title, String content, Instant createdAt, List<String> mediaUrls, int likeCount) {
        return BottleDetailResponseDto.builder()
                .code("SUCCESS")
                .message("Bottle details retrieved successfully.")
                .httpStatus(HttpStatus.OK)
                .data(new Data(bottleId, title, content, createdAt, mediaUrls, likeCount))
                .build();
    }

    // ✅ 유리병 없음
    public static BottleDetailResponseDto bottleNotFound() {
        return BottleDetailResponseDto.builder()
                .code("BOTTLE_NOT_FOUND")
                .message("The requested bottle does not exist.")
                .httpStatus(HttpStatus.NOT_FOUND)
                .build();
    }

    // ✅ 필수 필드 없음
    public static BottleDetailResponseDto missingBottleId() {
        return BottleDetailResponseDto.builder()
                .code("MISSING_BOTTLE_ID")
                .message("Bottle ID is required.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    // ✅ 인증 오류
    public static BottleDetailResponseDto unauthorized() {
        return BottleDetailResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }
}
