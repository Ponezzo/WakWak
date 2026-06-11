package com.social.bottle.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BottleRequestDto {

    @NotNull(message = "bottleId is required.")
    private Integer bottleId;
}
