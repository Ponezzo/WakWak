package com.social.login.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterDeviceRequestDto {
    private String deviceId;
    private String deviceName;
}
