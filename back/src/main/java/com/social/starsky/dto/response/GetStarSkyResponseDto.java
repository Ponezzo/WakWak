package com.social.starsky.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GetStarSkyResponseDto {
    private String code;
    private String message;
    private int skyId; // ✅ 변수명 camelCase 적용

    public static GetStarSkyResponseDto success(int skyId) {
        return GetStarSkyResponseDto.builder() // ✅ 올바른 클래스 사용
                .code("SUCCESS")
                .message("Currently equipped star sky retrieved successfully.")
                .skyId(skyId) // ✅ 변수명 수정
                .build();
    }
}
