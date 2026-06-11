package com.social.bottle.dto.response;

import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMessageResponseDto {
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
        private String title;
        private Instant createdAt;
        private List<String> mediaUrls;
    }

    public static CreateMessageResponseDto success(Integer bottleId, String title, Instant createdAt, List<String> mediaUrls) {
        return CreateMessageResponseDto.builder()
                .code("SUCCESS")
                .message("Message created successfully.")
                .data(new Data(bottleId, title, createdAt, mediaUrls))
                .build();
    }

    public static CreateMessageResponseDto missingRequiredFields() {
        return CreateMessageResponseDto.builder()
                .code("MISSING_REQUIRED_FIELDS")
                .message("Title and content are required.")
                .build();
    }

    public static CreateMessageResponseDto unauthorized() {
        return CreateMessageResponseDto.builder()
                .code("AUTH_REQUIRED")
                .message("Authentication token is required.")
                .build();
    }

    public static CreateMessageResponseDto serverError() {
        return CreateMessageResponseDto.builder()
                .code("ISE")
                .message("Internal server error.")
                .build();
    }
}
