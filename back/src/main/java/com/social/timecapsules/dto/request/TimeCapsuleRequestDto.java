package com.social.timecapsules.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeCapsuleRequestDto {

    @NotNull(message = "capsuleId is required.")
    private Integer capsuleId;
}
