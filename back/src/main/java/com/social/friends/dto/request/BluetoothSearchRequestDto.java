package com.social.friends.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class BluetoothSearchRequestDto {

    @NotEmpty(message = "deviceIds is required.")
    private List<String> deviceIds;
}
