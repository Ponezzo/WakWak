package com.social.timecapsules.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetTimeCapsuleMapResponseDto {

    private String code;
    private String message;
    private List<TimeCapsuleData> capsules;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimeCapsuleData {
        private Integer capsuleId;
        private String title;
        private Double latitude;
        private Double longitude;
        private String openDate;
    }

    public static GetTimeCapsuleMapResponseDto success(List<TimeCapsuleData> capsules) {
        return GetTimeCapsuleMapResponseDto.builder()
                .code("SUCCESS")
                .message("Time capsules retrieved successfully.")
                .capsules(capsules)
                .build();
    }
}
