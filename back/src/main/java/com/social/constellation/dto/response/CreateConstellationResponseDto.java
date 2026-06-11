package com.social.constellation.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CreateConstellationResponseDto {
    private String code;
    private String message;

    public static CreateConstellationResponseDto success() {
        return CreateConstellationResponseDto.builder()
                .code("SUCCESS")
                .message("Constellation created successfully.")
                .build();
    }

    public static CreateConstellationResponseDto missingName() {
        return CreateConstellationResponseDto.builder()
                .code("MISSING_NAME")
                .message("Constellation name is required.")
                .build();
    }

    public static CreateConstellationResponseDto missingStarData() {
        return CreateConstellationResponseDto.builder()
                .code("MISSING_STAR_DATA")
                .message("At least one star is required to create a constellation.")
                .build();
    }

    public static CreateConstellationResponseDto forbidden() {
        return CreateConstellationResponseDto.builder()
                .code("FORBIDDEN_STAR_ACCESS")
                .message("You do not have permission to use one or more stars in this constellation.")
                .build();
    }

    public static CreateConstellationResponseDto starNotFound() {
        return CreateConstellationResponseDto.builder()
                .code("STAR_NOT_FOUND")
                .message("One or more stars do not exist.")
                .build();
    }
}
