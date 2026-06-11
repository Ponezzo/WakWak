package com.social.bottle.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class CreateMessageRequestDto {

    @NotBlank(message = "Title is required.")
    private String title;

    @NotBlank(message = "Content is required.")
    private String content;

    private List<MultipartFile> media; // 이미지, 동영상 파일 리스트 (선택사항)

    public boolean hasMedia() {
        return media != null && !media.isEmpty();
    }
}
