package com.social.starsky.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class GetStarSkyEquipResponseDto {

    private String code;
    private String message;
    private Data data;

    @Getter
    @Setter
    @AllArgsConstructor
    @Builder
    public static class Data {
        private Integer userId;
        private Integer equippedSkyId;
    }

    // ✅ 성공 응답
    public static ResponseEntity<GetStarSkyEquipResponseDto> success(Integer userId, Integer skyId) {
        return ResponseEntity.ok(
                GetStarSkyEquipResponseDto.builder()
                        .code("SUCCESS")
                        .message("Star sky equipped successfully.")
                        .data(new Data(userId, skyId))
                        .build()
        );
    }

    // ✅ 인증 실패 (401 Unauthorized)
    public static ResponseEntity<GetStarSkyEquipResponseDto> authRequired() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new GetStarSkyEquipResponseDto("AUTH_REQUIRED", "Authentication token is required.", null));
    }

    // ✅ 존재하지 않는 skyId (404 Not Found)
    public static ResponseEntity<GetStarSkyEquipResponseDto> skyNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new GetStarSkyEquipResponseDto("SKY_NOT_FOUND", "The requested star sky does not exist.", null));
    }

    // ✅ 소유하지 않은 skyId 요청 (403 Forbidden)
    public static ResponseEntity<GetStarSkyEquipResponseDto> forbiddenSkyAccess() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new GetStarSkyEquipResponseDto("FORBIDDEN_SKY_ACCESS", "You do not have permission to equip this star sky.", null));
    }
}
