package com.social.inventory.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ClothesInventoryResponseDto {
    private String code;
    private String message;
    private Data data;

    @Getter
    @Setter
    @Builder
    public static class Data {
        private String itemName;
        private String description;
    }

    // ✅ 성공 응답
    public static ClothesInventoryResponseDto success(String itemName, String description) {
        return ClothesInventoryResponseDto.builder()
                .code("SUCCESS")
                .message("Clothes details retrieved successfully.")
                .data(Data.builder().itemName(itemName).description(description).build())
                .build();
    }

    // ✅ 존재하지 않는 item_id 요청 시
    public static ClothesInventoryResponseDto itemNotFound() {
        return ClothesInventoryResponseDto.builder()
                .code("ITEM_NOT_FOUND")
                .message("The requested item does not exist.")
                .build();
    }

    // ✅ 필수 필드 누락
    public static ClothesInventoryResponseDto missingItemId() {
        return ClothesInventoryResponseDto.builder()
                .code("MISSING_ITEM_ID")
                .message("Item ID is required.")
                .build();
    }

    // ✅ 인증 오류
    public static ClothesInventoryResponseDto unauthorized() {
        return ClothesInventoryResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }

    // ✅ 서버 오류
    public static ClothesInventoryResponseDto serverError() {
        return ClothesInventoryResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .build();
    }
}
