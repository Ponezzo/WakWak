package com.social.bottle.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.http.HttpStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BottleDeleteResponseDto {
    private String code;
    private String message;
    @JsonIgnore
    private HttpStatus httpStatus; // ✅ HTTP 상태 코드 추가

    // ✅ 성공 응답 (200 OK)
    public static BottleDeleteResponseDto success() {
        return BottleDeleteResponseDto.builder()
                .code("SUCCESS")
                .message("Bottle deleted successfully.")
                .httpStatus(HttpStatus.OK)
                .build();
    }

    // ✅ 유리병 없음 (404 Not Found)
    public static BottleDeleteResponseDto bottleNotFound() {
        return BottleDeleteResponseDto.builder()
                .code("BOTTLE_NOT_FOUND")
                .message("The requested bottle does not exist.")
                .httpStatus(HttpStatus.NOT_FOUND)
                .build();
    }

    // ✅ 권한 없음 (403 Forbidden)
    public static BottleDeleteResponseDto forbidden() {
        return BottleDeleteResponseDto.builder()
                .code("FORBIDDEN")
                .message("You are not authorized to delete this bottle.")
                .httpStatus(HttpStatus.FORBIDDEN)
                .build();
    }

    // ✅ 필수 필드 없음 (400 Bad Request)
    public static BottleDeleteResponseDto missingBottleId() {
        return BottleDeleteResponseDto.builder()
                .code("MISSING_BOTTLE_ID")
                .message("Bottle ID is required.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    // ✅ 인증 오류 (401 Unauthorized)
    public static BottleDeleteResponseDto unauthorized() {
        return BottleDeleteResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }

    // ✅ 유효하지 않은 토큰 (401 Unauthorized)
    public static BottleDeleteResponseDto invalidToken() {
        return BottleDeleteResponseDto.builder()
                .code("INVALID_TOKEN")
                .message("The provided token is invalid or expired.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }
}
