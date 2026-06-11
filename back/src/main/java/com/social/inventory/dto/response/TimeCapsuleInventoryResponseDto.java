package com.social.inventory.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeCapsuleInventoryResponseDto {
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
    }

    // ✅ 성공 응답
    public static TimeCapsuleInventoryResponseDto success(List<Data> capsuleList) {
        return TimeCapsuleInventoryResponseDto.builder()
                .code("SUCCESS")
                .message("Time capsules retrieved successfully.")
                .data(capsuleList)
                .build();
    }

    // ✅ 읽은 타임캡슐이 없는 경우
    public static TimeCapsuleInventoryResponseDto noCapsulesFound() {
        return TimeCapsuleInventoryResponseDto.builder()
                .code("SUCCESS")
                .message("No read time capsules found.")
                .data(List.of())
                .build();
    }

    // ✅ 인증 실패
    public static TimeCapsuleInventoryResponseDto unauthorized() {
        return TimeCapsuleInventoryResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }

    // ✅ 서버 오류
    public static TimeCapsuleInventoryResponseDto serverError() {
        return TimeCapsuleInventoryResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .build();
    }
}
