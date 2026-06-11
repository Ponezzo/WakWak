package com.social.starsky.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class GetStarsBySkyRequestDto {

    @NotNull(message = "Sky ID is required.")
    private Integer skyId;
}
