package com.social.timecapsules.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeCapsuleDetailResponseDto {
    private String code;
    private String message;
    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer capsuleId;
        private String title;
        private String content;
        private String createdAt;
        private String opendedAt;
        private Double latitude;
        private Double longitude;
        private Author author;
        private List<SharedUser> sharedUsers;
        private List<String> mediaUrls;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Author {
        private Integer userId;
        private String nickname;
        private String avatarUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SharedUser {
        private Integer userId;
        private String nickname;
        private String avatarUrl;
    }

    public static TimeCapsuleDetailResponseDto success(Integer capsuleId, String title, String content,
                                                       String createdAt, String opendedAt, Double latitude, Double longitude,
                                                       Author author, List<SharedUser> sharedUsers, List<String> mediaUrls) {
        return TimeCapsuleDetailResponseDto.builder()
                .code("SUCCESS")
                .message("Time capsule details retrieved successfully.")
                .data(new Data(capsuleId, title, content, createdAt, opendedAt, latitude, longitude, author, sharedUsers, mediaUrls))
                .build();
    }

    public static TimeCapsuleDetailResponseDto missingCapsuleId() {
        return new TimeCapsuleDetailResponseDto("MISSING_CAPSULE_ID", "Capsule ID is required.", null);
    }

    public static TimeCapsuleDetailResponseDto notFound() {
        return new TimeCapsuleDetailResponseDto("TIME_CAPSULE_NOT_FOUND", "Time capsule not found.", null);
    }

    public static TimeCapsuleDetailResponseDto accessDenied() {
        return new TimeCapsuleDetailResponseDto("ACCESS_DENIED", "You do not have access to this time capsule.", null);
    }

    public static TimeCapsuleDetailResponseDto unauthorized() {
        return new TimeCapsuleDetailResponseDto("AUTH_REQUIRED", "Authentication token is required.", null);
    }
}
