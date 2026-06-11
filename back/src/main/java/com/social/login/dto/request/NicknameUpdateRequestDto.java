package com.social.login.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NicknameUpdateRequestDto {

    @NotBlank(message = "nickname is required.")
    private String nickname;
}
