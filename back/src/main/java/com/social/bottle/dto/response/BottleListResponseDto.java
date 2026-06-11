package com.social.bottle.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BottleListResponseDto {
    private String code;
    private String message;
    private List<BottleData> data;
    @JsonIgnore
    private HttpStatus httpStatus; // ✅ HTTP 상태 코드 추가

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BottleData {
        private Integer bottleId;
        private String title;
    }

    // ✅ 성공 응답
    public static BottleListResponseDto success(List<BottleData> bottles) {
        return BottleListResponseDto.builder()
                .code("SUCCESS")
                .message("Bottles retrieved successfully.")
                .data(bottles)
                .httpStatus(HttpStatus.OK)
                .build();
    }

    // ✅ 24시간 지난 유리병 없음
    public static BottleListResponseDto noBottlesAvailable() {
        return BottleListResponseDto.builder()
                .code("NO_BOTTLE_AVAILABLE")
                .message("No bottles available that have passed 24 hours.")
                .httpStatus(HttpStatus.OK)
                .build();
    }

    // ✅ 인증 오류
    public static BottleListResponseDto unauthorized() {
        return BottleListResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }

    // ✅ 서버 오류
    public static BottleListResponseDto serverError() {
        return BottleListResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                .build();
    }
}
