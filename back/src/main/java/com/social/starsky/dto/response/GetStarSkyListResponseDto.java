package com.social.starsky.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GetStarSkyListResponseDto {
    private String code;
    private String message;
    private List<StarSkyData> data;

    @Getter
    @Builder
    public static class StarSkyData {
        private Integer starSkyId; // Integer 변경
    }

    public static GetStarSkyListResponseDto success(List<StarSkyData> data) {
        return GetStarSkyListResponseDto.builder()
                .code("SUCCESS")
                .message("Star sky list retrieved successfully.")
                .data(data)
                .build();
    }
}
