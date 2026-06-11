package com.social.timecapsules.dto.response;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTimeCapsuleResponseDto {

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
        private Integer userId;
        private String title;
        private String content;
        private Instant openedAt;
        private Double latitude;
        private Double longitude;
        private List<String> multimediaUrls;
        private List<Integer> accessUserIds;
    }
}
