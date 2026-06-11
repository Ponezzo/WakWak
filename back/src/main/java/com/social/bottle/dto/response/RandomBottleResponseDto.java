package com.social.bottle.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RandomBottleResponseDto {
    private String code;
    private String message;
    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer bottleId;
    }

    public static RandomBottleResponseDto success(Integer bottleId) {
        return RandomBottleResponseDto.builder()
                .code("SUCCESS")
                .message("Random bottle retrieved successfully.")
                .data(new Data(bottleId))
                .build();
    }

    public static RandomBottleResponseDto noBottleAvailable() {
        return RandomBottleResponseDto.builder()
                .code("NO_BOTTLE_AVAILABLE")
                .message("No available bottles at this moment.")
                .build();
    }

    public static RandomBottleResponseDto unauthorized() {
        return RandomBottleResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }
}
