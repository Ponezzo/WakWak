package com.social.constellation.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DeleteConstellationResponseDto {
    private String code;
    private String message;

    public static DeleteConstellationResponseDto success() {
        return DeleteConstellationResponseDto.builder()
                .code("SUCCESS")
                .message("Constellation deleted successfully.")
                .build();
    }

    public static DeleteConstellationResponseDto notFound() {
        return DeleteConstellationResponseDto.builder()
                .code("CONSTELLATION_NOT_FOUND")
                .message("Constellation with the given ID does not exist.")
                .build();
    }

    public static DeleteConstellationResponseDto forbidden() {
        return DeleteConstellationResponseDto.builder()
                .code("FORBIDDEN_CONSTELLATION_ACCESS")
                .message("You do not have permission to delete this constellation.")
                .build();
    }
}
