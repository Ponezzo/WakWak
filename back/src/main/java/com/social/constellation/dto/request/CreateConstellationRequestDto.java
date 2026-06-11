package com.social.constellation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class CreateConstellationRequestDto {

    @NotBlank(message = "Constellation name is required.")
    private String constellationName;

    @NotEmpty(message = "At least one star is required to create a constellation.")
    private List<StarData> constellationData;

    @Getter
    public static class StarData {
        @NotNull(message = "Star ID is required.")
        private Integer starId;

        @NotNull(message = "Star order is required.")
        private Integer starOrder;
    }
}
