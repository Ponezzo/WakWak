package com.social.login.dto.response.auth;

import lombok.*;
import org.springframework.http.HttpStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileImageUpdateResponseDto {
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
        private Integer userId;
        private String mediaUrl;
    }

    // ✅ 성공 응답 (프로필 이미지 변경 성공)
    public static ProfileImageUpdateResponseDto success(Integer userId, String mediaUrl) {
        return ProfileImageUpdateResponseDto.builder()
                .code("SUCCESS")
                .message("Profile image updated successfully.")
                .httpStatus(HttpStatus.OK)
                .data(new Data(userId, mediaUrl))
                .build();
    }

    // ✅ 파일 없음 오류 (400 Bad Request)
    public static ProfileImageUpdateResponseDto missingFile() {
        return ProfileImageUpdateResponseDto.builder()
                .code("MISSING_FILE")
                .message("Profile image file is required.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    // ✅ 잘못된 파일 형식 오류 (400 Bad Request)
    public static ProfileImageUpdateResponseDto invalidFileType() {
        return ProfileImageUpdateResponseDto.builder()
                .code("INVALID_FILE_TYPE")
                .message("Only image files (jpg, png, gif) are allowed.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    // ✅ 파일 크기 초과 오류 (400 Bad Request)
    public static ProfileImageUpdateResponseDto fileSizeExceeded() {
        return ProfileImageUpdateResponseDto.builder()
                .code("FILE_SIZE_EXCEEDED")
                .message("File size exceeds the maximum limit of 5MB.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    // ✅ 인증 오류 (401 Unauthorized)
    public static ProfileImageUpdateResponseDto unauthorized() {
        return ProfileImageUpdateResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }
}
