package com.social.friends.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestDto {
    @NotNull(message = "Receiver ID is required.")
    private Integer receiverId;
}
