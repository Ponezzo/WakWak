package com.social.inventory.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClothesInventoryRequestDto {

    @NotNull(message = "itemId is required.")
    private Integer itemId;
}
