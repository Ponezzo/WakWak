package com.social.login.dto.response.auth;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class RegisterDeviceResponseDto {
    private String code;
    private String message;
    private Data data;

    @Getter
    @Builder
    public static class Data {
        private Integer userId;
        private String deviceId;
        private String deviceName;
        private Instant registeredAt;
    }

    public static RegisterDeviceResponseDto success(Integer userId, String deviceId, String deviceName, Instant registeredAt) {
        return RegisterDeviceResponseDto.builder()
                .code("SUCCESS")
                .message("Device registered successfully.")
                .data(Data.builder()
                        .userId(userId)
                        .deviceId(deviceId)
                        .deviceName(deviceName)
                        .registeredAt(registeredAt)
                        .build())
                .build();
    }

    public static RegisterDeviceResponseDto authRequired() {
        return RegisterDeviceResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }
}
