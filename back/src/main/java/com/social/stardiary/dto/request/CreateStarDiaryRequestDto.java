package com.social.stardiary.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CreateStarDiaryRequestDto {

    @NotNull(message = "sky_id는 필수입니다.")
    private Integer skyId;

    @NotNull(message = "위도(latitude)는 필수입니다.")
    private Double latitude;

    @NotNull(message = "경도(longitude)는 필수입니다.")
    private Double longitude;

    @NotBlank(message = "제목(title)은 필수입니다.")
    private String title;

    @NotBlank(message = "내용(content)은 필수입니다.")
    private String content;

    private List<MultipartFile> mediaFiles; // ✅ 여러 개의 파일 첨부 가능
}
