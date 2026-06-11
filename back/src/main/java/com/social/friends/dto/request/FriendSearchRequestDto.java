package com.social.friends.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendSearchRequestDto {

    @NotBlank(message = "Nickname parameter is required.")
    private String nickname;
}
