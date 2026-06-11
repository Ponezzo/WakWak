package com.social.constellation.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GetConstellationNameResponseDto {
    private String code;
    private String message;
    private ConstellationData data;

    @Getter
    @Builder
    public static class ConstellationData {
        private Integer constellationId;
        private String constellationName;
    }

    public static GetConstellationNameResponseDto success(Integer constellationId, String constellationName) {
        return GetConstellationNameResponseDto.builder()
                .code("SUCCESS")
                .message("Constellation name retrieved successfully.")
                .data(ConstellationData.builder()
                        .constellationId(constellationId)
                        .constellationName(constellationName)
                        .build())
                .build();
    }

    public static GetConstellationNameResponseDto notFound() {
        return GetConstellationNameResponseDto.builder()
                .code("CONSTELLATION_NOT_FOUND")
                .message("Constellation with the given ID does not exist.")
                .build();
    }
}
