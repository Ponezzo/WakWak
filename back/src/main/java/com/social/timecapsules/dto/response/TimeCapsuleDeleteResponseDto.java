package com.social.timecapsules.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeCapsuleDeleteResponseDto {
    private String code;
    private String message;
    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer capsuleId;
    }

    public static TimeCapsuleDeleteResponseDto success(Integer capsuleId) {
        return TimeCapsuleDeleteResponseDto.builder()
                .code("SUCCESS")
                .message("Time capsule deleted successfully.")
                .data(new Data(capsuleId))
                .build();
    }

    public static TimeCapsuleDeleteResponseDto missingCapsuleId() {
        return new TimeCapsuleDeleteResponseDto("MISSING_CAPSULE_ID", "Capsule ID is required.", null);
    }

    public static TimeCapsuleDeleteResponseDto timeCapsuleNotFound() {
        return new TimeCapsuleDeleteResponseDto("TIME_CAPSULE_NOT_FOUND", "Time capsule not found.", null);
    }

    public static TimeCapsuleDeleteResponseDto accessDenied() {
        return new TimeCapsuleDeleteResponseDto("ACCESS_DENIED", "You do not have permission to delete this time capsule.", null);
    }

    public static TimeCapsuleDeleteResponseDto unauthorized() {
        return new TimeCapsuleDeleteResponseDto("AUTH_REQUIRED", "Authentication token is required.", null);
    }
}
