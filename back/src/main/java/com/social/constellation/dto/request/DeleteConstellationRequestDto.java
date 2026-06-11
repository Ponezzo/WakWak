package com.social.constellation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class DeleteConstellationRequestDto {

    @NotNull(message = "Constellation ID is required.")
    private Integer constellationId;
}
