package com.social.starsky.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetStarSkyEquipRequestDto {

    @NotNull(message = "Sky ID is required.")
    private Integer skyId;
}
