package com.social.stardiary.service.implement;

import com.social.constellation.repository.ConstellationNameRepository;
import com.social.global.service.AwsS3Service;
import com.social.stardiary.dto.request.CreateStarDiaryRequestDto;
import com.social.stardiary.dto.response.CreateStarDiaryResponseDto;
import com.social.stardiary.dto.response.DeleteStarDiaryResponseDto;
import com.social.stardiary.dto.response.GetStarDiaryResponseDto;
import com.social.stardiary.entity.Star;
import com.social.stardiary.entity.StarDiary;
import com.social.stardiary.entity.StarDiaryMedia;
import com.social.stardiary.repository.StarDiaryMediaRepository;
import com.social.stardiary.repository.StarDiaryRepository;
import com.social.stardiary.repository.StarRepository;
import com.social.stardiary.service.StarDiaryService;
import com.social.starsky.entity.StarSky;
import com.social.starsky.repository.StarSkyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StarDiaryServiceImplement implements StarDiaryService {
    private final StarRepository starRepository;
    private final StarDiaryRepository starDiaryRepository;
    private final StarDiaryMediaRepository starDiaryMediaRepository;
    private final StarSkyRepository starSkyRepository;
    private final AwsS3Service awsS3Service; // ✅ AWS S3 서비스 추가
    private final ConstellationNameRepository constellationNameRepository;

    public CreateStarDiaryResponseDto createStarDiary(CreateStarDiaryRequestDto requestDto) {
        log.info("📌 [별 일기 생성] 요청 데이터: skyId={}, title={}, mediaFilesCount={}",
                requestDto.getSkyId(), requestDto.getTitle(),
                (requestDto.getMediaFiles() != null) ? requestDto.getMediaFiles().size() : 0);

        // ✅ sky_id가 존재하는지 확인
        StarSky starSky = starSkyRepository.findById(requestDto.getSkyId())
                .orElseThrow(() -> {
                    log.error("❌ [오류] 유효하지 않은 sky_id: {}", requestDto.getSkyId());
                    return new IllegalArgumentException("Invalid sky_id");
                });

        // ✅ star 테이블에 데이터 저장
        Star star = starRepository.save(Star.builder()
                .starSky(starSky)
                .latitude(requestDto.getLatitude())
                .longitude(requestDto.getLongitude())
                .build());

        log.info("✅ [별 생성 완료] starId={} (skyId={}, latitude={}, longitude={})",
                star.getStarId(), star.getStarSky().getSkyId(), star.getLatitude(), star.getLongitude());

        // ✅ star_diary 테이블에 데이터 저장
        starDiaryRepository.save(StarDiary.builder()
                .star(star)
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .build());

        // ✅ S3에 이미지 업로드 후 URL 저장
        if (requestDto.getMediaFiles() != null) {
            List<StarDiaryMedia> mediaEntities = requestDto.getMediaFiles().stream()
                    .map(file -> saveMedia(file, star))
                    .collect(Collectors.toList());
            starDiaryMediaRepository.saveAll(mediaEntities);
            log.info("✅ [미디어 저장 완료] starId={}, 저장된 미디어 개수={}", star.getStarId(), mediaEntities.size());
        }

        return CreateStarDiaryResponseDto.success(star.getStarId());
    }

    private StarDiaryMedia saveMedia(MultipartFile file, Star star) {
        String mediaUrl = awsS3Service.uploadFile(file); // ✅ S3 업로드 후 URL 반환
        log.info("📌 [S3 업로드 완료] starId={}, 파일 URL={}", star.getStarId(), mediaUrl);
        return StarDiaryMedia.builder()
                .star(star)
                .mediaUrl(mediaUrl)
                .build();
    }

    @Override
    public GetStarDiaryResponseDto getStarDiaryByStarId(Integer starId) {
        log.info("📌 [별 일기 조회] 요청된 starId={}", starId);

        // ✅ 1. 별 일기 조회
        StarDiary starDiary = starDiaryRepository.findById(starId).orElse(null);

        if (starDiary == null) {
            log.warn("❌ [별 일기 없음] starId={}에 대한 일기를 찾을 수 없음", starId);
            return GetStarDiaryResponseDto.notFound();
        }

        // ✅ 2. 해당 starId의 미디어 파일 조회
        List<String> mediaUrls = starDiaryMediaRepository.findByStar_StarId(starId)
                .stream()
                .map(StarDiaryMedia::getMediaUrl)
                .collect(Collectors.toList());

        log.info("✅ [별 일기 조회 성공] starId={}, mediaUrls 개수={}", starId, mediaUrls.size());

        return GetStarDiaryResponseDto.success(
                starDiary.getStar().getStarId(),
                starDiary.getCreatedAt(),
                starDiary.getTitle(),
                starDiary.getContent(),
                mediaUrls
        );
    }

    @Override
    public void checkOwnership(Integer userId, Integer starId) {
        log.info("📌 [별 소유 검증] userId={}, starId={}", userId, starId);

        // ✅ 사용자가 해당 star_id를 소유하는지 확인
        boolean isOwner = starSkyRepository.existsByUser_UserIdAndSkyId(userId,
                starSkyRepository.findSkyIdByStarId(starId));

        if (!isOwner) {
            log.warn("❌ [소유권 검증 실패] userId={}는 starId={}의 소유자가 아닙니다!", userId, starId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "당신의 별 일기가 아닙니다.");
        }

        log.info("✅ [소유권 검증 성공] userId={}가 starId={}를 소유하고 있습니다.", userId, starId);
    }

    @Override
    @Transactional
    public DeleteStarDiaryResponseDto deleteStarDiary(Integer userId, Integer starId) {
        log.info("📌 [별 삭제 요청] 사용자 ID: {}, starId={}", userId, starId);

        // ✅ 1. 별 조회
        Star star = starRepository.findById(starId).orElse(null);
        if (star == null) {
            log.warn("❌ [삭제 실패] starId={}에 해당하는 별이 없음", starId);
            return DeleteStarDiaryResponseDto.notFound();
        }

        // ✅ 2. 사용자 소유 확인
        if (!star.getStarSky().getUser().getUserId().equals(userId)) {
            log.warn("❌ [별 소유 오류] 사용자 ID: {}, starId: {}", userId, starId);
            return DeleteStarDiaryResponseDto.forbidden();
        }

        // ✅ 3. `star_diary_media`에서 S3 URL 가져오기
        List<String> mediaUrls = starDiaryMediaRepository.findMediaUrlsByStarId(starId);
        log.info("📌 [S3 삭제 대상 파일] starId={}, 파일 개수={}", starId, mediaUrls.size());

        // ✅ 4. S3에서 파일 삭제
        for (String url : mediaUrls) {
            awsS3Service.deleteFileFromS3(url);
        }

        // ✅ 5. `star_diary_media` 테이블에서 데이터 삭제
        starDiaryMediaRepository.deleteByStarId(starId);
        log.info("✅ [별 미디어 삭제 완료] starId={}", starId);

        // ✅ 6. `constellation_name` 삭제
        constellationNameRepository.deleteByStarId(starId);
        log.info("✅ [별자리 이름 삭제 완료] starId={}", starId);

        // ✅ 7. `star` 삭제
        starRepository.deleteByStarId(starId);
        log.info("✅ [별 삭제 완료] starId={}", starId);

        return DeleteStarDiaryResponseDto.success();
    }



}

