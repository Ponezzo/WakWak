package com.social.constellation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class GetConstellationNameRequestDto {

    @NotNull(message = "Constellation ID is required.")
    private Integer constellationId;
}
