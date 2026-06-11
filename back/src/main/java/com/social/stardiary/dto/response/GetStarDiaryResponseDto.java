package com.social.stardiary.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class GetStarDiaryResponseDto {
    private String code;
    private String message;
    private Integer starId;
    private LocalDateTime createdAt;
    private String title;
    private String content;
    private List<String> mediaUrls;

    public static GetStarDiaryResponseDto success(Integer starId, LocalDateTime createdAt, String title, String content, List<String> mediaUrls) {
        return GetStarDiaryResponseDto.builder()
                .code("SU")
                .message("Success.")
                .starId(starId)
                .createdAt(createdAt)
                .title(title)
                .content(content)
                .mediaUrls(mediaUrls)
                .build();
    }

    public static GetStarDiaryResponseDto notFound() {
        return GetStarDiaryResponseDto.builder()
                .code("ND")
                .message("No diary found for this star.")
                .build();
    }
}
