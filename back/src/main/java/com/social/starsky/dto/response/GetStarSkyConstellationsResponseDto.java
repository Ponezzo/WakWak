package com.social.starsky.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GetStarSkyConstellationsResponseDto {
    private String code;
    private String message;
    private Data data;

    @Getter
    @Builder
    public static class Data {
        private List<ConstellationData> constellations;
    }

    @Getter
    @Builder
    public static class ConstellationData {
        private Integer constellationId;
        private String constellationName;
        private List<StarData> stars;
    }

    @Getter
    @Builder
    public static class StarData {
        private Integer starId;
        private Double latitude;
        private Double longitude;
        private Integer order;
    }

    public static GetStarSkyConstellationsResponseDto success(List<ConstellationData> constellations) {
        return GetStarSkyConstellationsResponseDto.builder()
                .code("SUCCESS")
                .message(constellations.isEmpty() ? "No constellations found." : "Constellations retrieved successfully.")
                .data(Data.builder().constellations(constellations).build())
                .build();
    }

    public static GetStarSkyConstellationsResponseDto skyNotFound() {
        return GetStarSkyConstellationsResponseDto.builder()
                .code("SKY_NOT_FOUND")
                .message("The requested sky does not exist.")
                .build();
    }

    public static GetStarSkyConstellationsResponseDto forbidden() {
        return GetStarSkyConstellationsResponseDto.builder()
                .code("FORBIDDEN_SKY_ACCESS")
                .message("You do not have permission to access this sky.")
                .build();
    }
}
