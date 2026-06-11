package com.social.bottle.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BottleCommentRequestDto {

    @NotNull(message = "bottleId is required.")
    private Integer bottleId;

    private Integer parentId; // 대댓글이면 부모 댓글 ID (선택 사항)

    @NotBlank(message = "content is required.")
    @Size(min=1, max = 255, message = "Comment content must be between 1 and 255 characters.")
    private String content;
}
