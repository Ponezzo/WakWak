package com.social.starsky.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GetStarsBySkyResponseDto {
    private String code;
    private String message;
    private List<StarData> data;

    @Getter
    @Builder
    public static class StarData {
        private Integer starId;
        private Double latitude;
        private Double longitude;
    }

    public static GetStarsBySkyResponseDto success(List<StarData> stars) {
        String message = stars.isEmpty() ? "No stars found." : "Stars retrieved successfully.";

        return GetStarsBySkyResponseDto.builder()
                .code("SUCCESS")
                .message(message)
                .data(stars)
                .build();
    }

    public static GetStarsBySkyResponseDto skyNotFound() {
        return GetStarsBySkyResponseDto.builder()
                .code("SKY_NOT_FOUND")
                .message("The requested sky does not exist.")
                .build();
    }

    public static GetStarsBySkyResponseDto forbidden() {
        return GetStarsBySkyResponseDto.builder()
                .code("FORBIDDEN_SKY_ACCESS")
                .message("You do not have permission to access this sky.")
                .build();
    }
}
