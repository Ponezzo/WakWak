package com.social.constellation.service.implement;

import com.social.constellation.dto.request.CreateConstellationRequestDto;
import com.social.constellation.dto.request.DeleteConstellationRequestDto;
import com.social.constellation.dto.request.GetConstellationNameRequestDto;
import com.social.constellation.dto.response.CreateConstellationResponseDto;
import com.social.constellation.dto.response.DeleteConstellationResponseDto;
import com.social.constellation.dto.response.GetConstellationNameResponseDto;
import com.social.constellation.entity.Constellation;
import com.social.constellation.entity.ConstellationName;
import com.social.constellation.exception.StarOwnershipException;
import com.social.constellation.repository.ConstellationNameRepository;
import com.social.constellation.repository.ConstellationRepository;
import com.social.constellation.service.ConstellationService;
import com.social.login.provider.JWTProvider;
import com.social.stardiary.entity.Star;
import com.social.stardiary.repository.StarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConstellationServiceImplement implements ConstellationService {

    private final ConstellationNameRepository constellationNameRepository;
    private final ConstellationRepository constellationRepository;
    private final StarRepository starRepository;

    @Override
    @Transactional
    public CreateConstellationResponseDto createConstellation(Integer userId, CreateConstellationRequestDto requestDto) {
        log.info("📌 [별자리 생성 요청] 사용자 ID: {}, 별자리 이름: {}", userId, requestDto.getConstellationName());

        // ✅ 1. 별자리 이름 저장
        ConstellationName constellationName = constellationNameRepository.save(
                ConstellationName.builder()
                        .constellationName(requestDto.getConstellationName())
                        .build()
        );

        Integer constellationId = constellationName.getConstellationId();

        // ✅ 2. 사용자의 별만 사용하도록 검증
        for (CreateConstellationRequestDto.StarData starData : requestDto.getConstellationData()) {
            Star star = starRepository.findById(starData.getStarId())
                    .orElseThrow(() -> new StarOwnershipException("One or more stars do not exist."));

            if (!star.getStarSky().getUser().getUserId().equals(userId)) {
                log.warn("❌ [별 소유 오류] 사용자 ID: {}, starId: {}", userId, starData.getStarId());
                return CreateConstellationResponseDto.forbidden();
            }

            constellationRepository.save(
                    Constellation.builder()
                            .star(star)
                            .constellationName(constellationName)
                            .starOrder(starData.getStarOrder())
                            .build()
            );
        }

        log.info("✅ [별자리 생성 완료] 별자리 ID: {}", constellationId);
        return CreateConstellationResponseDto.success();
    }

    @Override
    public GetConstellationNameResponseDto getConstellationName(GetConstellationNameRequestDto requestDto) {
        log.info("📌 [별자리 이름 조회 요청] constellationId={}", requestDto.getConstellationId());

        // ✅ 별자리 이름 조회
        ConstellationName constellationName = constellationNameRepository.findById(requestDto.getConstellationId())
                .orElse(null);

        if (constellationName == null) {
            log.warn("❌ [별자리 조회 실패] 존재하지 않는 constellationId={}", requestDto.getConstellationId());
            return GetConstellationNameResponseDto.notFound();
        }

        log.info("✅ [별자리 조회 성공] constellationId={}, constellationName={}",
                constellationName.getConstellationId(), constellationName.getConstellationName());

        return GetConstellationNameResponseDto.success(
                constellationName.getConstellationId(),
                constellationName.getConstellationName()
        );
    }

    @Override
    @Transactional
    public DeleteConstellationResponseDto deleteConstellation(Integer userId, DeleteConstellationRequestDto requestDto) {
        log.info("📌 [별자리 삭제 요청] 사용자 ID: {}, constellationId={}", userId, requestDto.getConstellationId());

        // ✅ 1. 별자리 이름 조회
        ConstellationName constellationName = constellationNameRepository.findById(requestDto.getConstellationId())
                .orElse(null);

        if (constellationName == null) {
            log.warn("❌ [삭제 실패] 존재하지 않는 constellationId={}", requestDto.getConstellationId());
            return DeleteConstellationResponseDto.notFound();
        }

        // ✅ 2. 사용자가 해당 별자리를 삭제할 권한이 있는지 확인
        List<Constellation> constellations = constellationRepository.findByConstellationName_ConstellationId(requestDto.getConstellationId());

        for (Constellation constellation : constellations) {
            Star star = constellation.getStar();
            if (!star.getStarSky().getUser().getUserId().equals(userId)) {
                log.warn("❌ [별자리 소유 오류] 사용자 ID: {}, constellationId: {}", userId, requestDto.getConstellationId());
                return DeleteConstellationResponseDto.forbidden();
            }
        }

        // ✅ 3. 연결된 `constellation` 데이터 삭제
        if (!constellations.isEmpty()) {
            constellationRepository.deleteByConstellationName_ConstellationId(requestDto.getConstellationId());
            log.info("✅ [별자리 연결 삭제 완료] constellationId={}", requestDto.getConstellationId());
        }

        // ✅ 4. `constellation_name` 삭제
        constellationNameRepository.delete(constellationName);
        log.info("✅ [별자리 삭제 완료] constellationId={}", requestDto.getConstellationId());

        return DeleteConstellationResponseDto.success();
    }
}
