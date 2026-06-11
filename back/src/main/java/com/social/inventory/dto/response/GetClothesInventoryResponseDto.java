package com.social.inventory.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetClothesInventoryResponseDto {

    private String code;
    private String message;
    private List<Data> data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer itemId;
        private Integer hasItem;
    }

    public static GetClothesInventoryResponseDto success(List<Data> data) {
        return GetClothesInventoryResponseDto.builder()
                .code("SUCCESS")
                .message("Clothes inventory retrieved successfully.")
                .data(data)
                .build();
    }

    public static GetClothesInventoryResponseDto unauthorized() {
        return GetClothesInventoryResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }

    public static GetClothesInventoryResponseDto serverError() {
        return GetClothesInventoryResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .build();
    }
}
