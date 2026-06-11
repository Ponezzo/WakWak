package com.social.stardiary.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CreateStarDiaryResponseDto {
    private String code;
    private String message;
    private Integer starId;

    public static CreateStarDiaryResponseDto success(Integer starId) {
        return CreateStarDiaryResponseDto.builder()
                .code("SUCCESS")
                .message("Star diary created successfully.")
                .starId(starId)
                .build();
    }
}
