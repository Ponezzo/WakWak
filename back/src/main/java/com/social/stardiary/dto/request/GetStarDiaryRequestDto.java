package com.social.stardiary.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class GetStarDiaryRequestDto {
    @NotNull(message = "star_id는 필수입니다.")
    private Integer starId;
}
