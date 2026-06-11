package com.social.login.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SendVerificationCodeRequestDto {

    @NotBlank
    private String id;

    @Email
    @NotBlank
    private String email;
}
