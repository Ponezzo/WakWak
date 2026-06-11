package com.social.stardiary.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DeleteStarDiaryResponseDto {
    private String code;
    private String message;

    public static DeleteStarDiaryResponseDto success() {
        return DeleteStarDiaryResponseDto.builder()
                .code("SU")
                .message("별 일기가 성공적으로 삭제되었습니다.")
                .build();
    }

    public static DeleteStarDiaryResponseDto notFound() {
        return DeleteStarDiaryResponseDto.builder()
                .code("ND")
                .message("삭제할 별 일기를 찾을 수 없습니다.")
                .build();
    }

    public static DeleteStarDiaryResponseDto forbidden() {
        return DeleteStarDiaryResponseDto.builder()
                .code("FORBIDDEN")
                .message("당신의 별 일기가 아닙니다.")
                .build();
    }
}
