package com.social.friends.dto.response;

import lombok.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BluetoothSearchResponseDto {
    private String code;
    private String message;
    private HttpStatus httpStatus;
    private List<Data> data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer userId;
        private String nickname;
        private String mediaUrl;
    }

    public static BluetoothSearchResponseDto success(List<Data> data) {
        return BluetoothSearchResponseDto.builder()
                .code("SUCCESS")
                .message("Nearby users retrieved successfully.")
                .httpStatus(HttpStatus.OK)
                .data(data)
                .build();
    }

    public static BluetoothSearchResponseDto missingDeviceIds() {
        return BluetoothSearchResponseDto.builder()
                .code("MISSING_DEVICE_IDS")
                .message("Device IDs are required.")
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }

    public static BluetoothSearchResponseDto noNearbyUsers() {
        return BluetoothSearchResponseDto.builder()
                .code("SUCCESS")
                .message("No nearby users found.")
                .httpStatus(HttpStatus.OK)
                .data(List.of()) // 빈 리스트 반환
                .build();
    }

    public static BluetoothSearchResponseDto authRequired() {
        return BluetoothSearchResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }
}
