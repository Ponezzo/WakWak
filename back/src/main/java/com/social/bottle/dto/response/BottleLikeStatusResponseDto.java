package com.social.bottle.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BottleLikeStatusResponseDto {
    private String code;
    private String message;
    private Data data;

    @Getter
    @Builder
    public static class Data {
        private Integer bottleId;
        private String status;  // "LIKED" or "NOT_LIKED"
    }

    public static BottleLikeStatusResponseDto success(Integer bottleId, String status) {
        return BottleLikeStatusResponseDto.builder()
                .code("SUCCESS")
                .message("Like status retrieved successfully.")
                .data(Data.builder()
                        .bottleId(bottleId)
                        .status(status)
                        .build())
                .build();
    }

    public static BottleLikeStatusResponseDto missingBottleId() {
        return BottleLikeStatusResponseDto.builder()
                .code("MISSING_BOTTLE_ID")
                .message("Bottle ID is required.")
                .build();
    }

    public static BottleLikeStatusResponseDto bottleNotFound() {
        return BottleLikeStatusResponseDto.builder()
                .code("BOTTLE_NOT_FOUND")
                .message("The requested bottle does not exist.")
                .build();
    }

    public static BottleLikeStatusResponseDto authRequired() {
        return BottleLikeStatusResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }

    public static BottleLikeStatusResponseDto invalidToken() {
        return BottleLikeStatusResponseDto.builder()
                .code("INVALID_TOKEN")
                .message("The provided token is invalid or expired.")
                .build();
    }

    public static BottleLikeStatusResponseDto serverError() {
        return BottleLikeStatusResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .build();
    }
}
