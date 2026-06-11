package com.social.timecapsules.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GetTimeCapsuleMapRequestDto {

    @NotNull(message = "Left longitude is required.")
    @Min(value = -180, message = "Longitude must be between -180 and 180.")
    @Max(value = 180, message = "Longitude must be between -180 and 180.")
    private Double left;

    @NotNull(message = "Right longitude is required.")
    @Min(value = -180, message = "Longitude must be between -180 and 180.")
    @Max(value = 180, message = "Longitude must be between -180 and 180.")
    private Double right;

    @NotNull(message = "Upper latitude is required.")
    @Min(value = -90, message = "Latitude must be between -90 and 90.")
    @Max(value = 90, message = "Latitude must be between -90 and 90.")
    private Double up;

    @NotNull(message = "Lower latitude is required.")
    @Min(value = -90, message = "Latitude must be between -90 and 90.")
    @Max(value = 90, message = "Latitude must be between -90 and 90.")
    private Double down;
}
