package com.social.friends.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRejectRequestDto {
    @NotNull(message = "Sender ID is required.")
    private Integer senderId;
}
