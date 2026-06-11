package com.social.friends.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendDeleteRequestDto {

    @NotNull(message = "Friend ID is required.")
    private Integer friendId;
}
