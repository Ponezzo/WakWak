package com.social.timecapsules.dto.response;

import com.social.timecapsules.entity.TimeCapsule;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeCapsuleCollectResponseDto {
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
        private String createdAt;
    }

    public static TimeCapsuleCollectResponseDto success(List<TimeCapsule> collectableCapsules) {
        List<Data> capsuleData = collectableCapsules.stream()
                .map(capsule -> new Data(
                        capsule.getCapsuleId(),
                        capsule.getTitle(),
                        capsule.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());

        return TimeCapsuleCollectResponseDto.builder()
                .code("SUCCESS")
                .message("Collectable time capsules retrieved successfully.")
                .data(capsuleData)
                .build();
    }

    public static TimeCapsuleCollectResponseDto noCollectableCapsules() {
        return TimeCapsuleCollectResponseDto.builder()
                .code("SUCCESS")
                .message("No collectable time capsules found.")
                .data(List.of())
                .build();
    }

    public static TimeCapsuleCollectResponseDto unauthorized() {
        return TimeCapsuleCollectResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .data(null)
                .build();
    }
}
