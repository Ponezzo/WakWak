package com.social.timecapsules.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetTimeCapsuleMapListResponseDto {
    private String code;
    private String message;
    private List<Data> data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer capsuleId;
        private String title;
        private Double latitude;
        private Double longitude;
        private String openedAt;
    }

    // ✅ 성공 응답
    public static GetTimeCapsuleMapListResponseDto success(List<Data> data) {
        return GetTimeCapsuleMapListResponseDto.builder()
                .code("SUCCESS")
                .message(data.isEmpty() ? "No time capsules found." : "Time capsules retrieved successfully.")
                .data(data)
                .build();
    }

    // ✅ 인증 실패
    public static GetTimeCapsuleMapListResponseDto unauthorized() {
        return GetTimeCapsuleMapListResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }

    // ✅ 서버 오류
    public static GetTimeCapsuleMapListResponseDto serverError() {
        return GetTimeCapsuleMapListResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .build();
    }
}
