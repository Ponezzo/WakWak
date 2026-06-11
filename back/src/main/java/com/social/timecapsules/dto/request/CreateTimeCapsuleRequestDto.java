package com.social.timecapsules.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTimeCapsuleRequestDto {

    @NotBlank(message = "Title is required.")
    private String title;

    @NotBlank(message = "Content is required.")
    private String content;

    @NotBlank(message = "OpenedAt is required and must be in ISO 8601 format.")
    private String openedAt;

    @NotNull(message = "Latitude is required.")
    private Double latitude;

    @NotNull(message = "Longitude is required.")
    private Double longitude;

    private List<Integer> accessUserIds; // 친구 공유 대상 (null 가능)
}
