package com.social.bottle.service.implement;

import com.social.bottle.dto.request.CreateMessageRequestDto;
import com.social.bottle.dto.response.*;
import com.social.bottle.entity.Bottle;
import com.social.bottle.entity.BottleLike;
import com.social.bottle.entity.BottleMedia;
import com.social.bottle.repository.BottleLikeRepository;
import com.social.bottle.repository.BottleMediaRepository;
import com.social.bottle.repository.BottleRepository;
import com.social.bottle.service.BottleService;
import com.social.global.service.AwsS3Service;
import com.social.login.entity.User;
import com.social.login.provider.JWTProvider;
import com.social.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BottleServiceImplement implements BottleService {

    private final BottleRepository bottleRepository;
    private final BottleMediaRepository bottleMediaRepository;
    private final UserRepository userRepository;
    private final JWTProvider jwtProvider;
    private final AwsS3Service awsS3Service;
    private final BottleLikeRepository bottleLikeRepository;

    @Transactional
    @Override
    public CreateMessageResponseDto createMessage(Integer userId, CreateMessageRequestDto request) {

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.error("❌ [유리병 작성 실패] 사용자 정보 조회 실패");
            return CreateMessageResponseDto.serverError();
        }
        User user = userOpt.get();
        Bottle bottle = bottleRepository.save(Bottle.builder()
                .user(user)
                .title(request.getTitle())
                .content(request.getContent())
                .createdAt(Instant.now())
                .build());

        List<String> mediaUrls = new ArrayList<>();
        if (request.getMedia() != null) {
            for (MultipartFile file : request.getMedia()) {
                String mediaUrl = awsS3Service.uploadFile(file);
                bottleMediaRepository.save(BottleMedia.builder()
                        .bottle(bottle)
                        .mediaUrl(mediaUrl)
                        .build());
                mediaUrls.add(mediaUrl);
            }
        }

        log.info("✅ [유리병 작성 완료] bottleId={}, userId={}", bottle.getBottleId(), userId);
        return CreateMessageResponseDto.success(bottle.getBottleId(), bottle.getTitle(), bottle.getCreatedAt(), mediaUrls);
    }

    @Transactional(readOnly = true)
    @Override
    public RandomBottleResponseDto getRandomBottle(Integer userId) {

        Instant twentyFourHoursAgo = Instant.now().minusSeconds(24 * 60 * 60);

        List<Bottle> availableBottles = bottleRepository.findAvailableBottles(userId, twentyFourHoursAgo);

        if (availableBottles.isEmpty()) {
            log.info("📌 [유리병 랜덤 획득] 가능한 유리병 없음");
            return RandomBottleResponseDto.noBottleAvailable();
        }

        Bottle selectedBottle = availableBottles.get(ThreadLocalRandom.current().nextInt(availableBottles.size()));

        log.info("✅ [유리병 랜덤 획득 성공] bottleId={}", selectedBottle.getBottleId());
        return RandomBottleResponseDto.success(selectedBottle.getBottleId());
    }

    @Override
    public BottleListResponseDto getExpiredBottles(Integer userId) {

        Instant twentyFourHoursAgo = Instant.now().minusSeconds(24 * 60 * 60);  // ✅ Instant 유지

        List<Bottle> expiredBottles = bottleRepository.findExpiredBottles(userId, twentyFourHoursAgo);

        if (expiredBottles.isEmpty()) {
            log.info("📌 [유리병 전체 조회] 24시간 지난 유리병 없음");
            return BottleListResponseDto.noBottlesAvailable();
        }

        log.info("✅ [유리병 전체 조회 성공] 유리병 개수={}", expiredBottles.size());

        return BottleListResponseDto.success(expiredBottles.stream()
                .map(b -> new BottleListResponseDto.BottleData(b.getBottleId(), b.getTitle()))
                .collect(Collectors.toList()));
    }

    @Override
    public BottleDetailResponseDto getBottleDetails(Integer userId, Integer bottleId) {

        Optional<Bottle> bottleOpt = bottleRepository.findById(bottleId);
        if (bottleOpt.isEmpty()) {
            log.warn("❌ [유리병 상세 조회 실패] 존재하지 않는 유리병 ID={}", bottleId);
            return BottleDetailResponseDto.bottleNotFound();
        }
        Bottle bottle = bottleOpt.get();

        List<String> mediaUrls = bottleMediaRepository.findByBottle_BottleId(bottleId)
                .stream().map(media -> media.getMediaUrl()).collect(Collectors.toList());

        int likeCount = bottleLikeRepository.countLikes(bottleId);

        log.info("✅ [유리병 상세 조회 성공] bottle_id={}, title={}", bottleId, bottle.getTitle());

        return BottleDetailResponseDto.success(
                bottle.getBottleId(),
                bottle.getTitle(),
                bottle.getContent(),
                bottle.getCreatedAt(),
                mediaUrls,
                likeCount
        );
    }

    @Override
    @Transactional
    public BottleDeleteResponseDto deleteBottle(Integer userId, Integer bottleId) {

        Optional<Bottle> bottleOpt = bottleRepository.findById(bottleId);
        if (bottleOpt.isEmpty()) {
            log.warn("❌ [유리병 삭제 실패] 존재하지 않거나 본인 작성 아님 bottle_id={}", bottleId);
            return BottleDeleteResponseDto.forbidden();
        }
        Bottle bottle = bottleOpt.get();

        // ✅ S3 파일 삭제
        List<BottleMedia> mediaList = bottleMediaRepository.findByBottle_BottleId(bottleId);
        for (BottleMedia media : mediaList) {
            awsS3Service.deleteFileFromS3(media.getMediaUrl());
        }

        // ✅ 최종적으로 유리병 삭제
        bottleRepository.delete(bottle);

        log.info("✅ [유리병 삭제 성공] bottle_id={}", bottleId);
        return BottleDeleteResponseDto.success();
    }

    @Override
    @Transactional
    public BottleLikeResponseDto likeBottle(Integer userId, Integer bottleId) {

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.error("❌ [유리병 좋아요 실패] 사용자 정보 조회 실패");
            return BottleLikeResponseDto.unauthorized();
        }
        User user = userOpt.get();

        Optional<Bottle> bottleOpt = bottleRepository.findById(bottleId);
        if (bottleOpt.isEmpty()) {
            log.warn("❌ [유리병 좋아요 실패] 존재하지 않는 bottle_id={}", bottleId);
            return BottleLikeResponseDto.bottleNotFound();
        }
        Bottle bottle = bottleOpt.get();

        if (bottleLikeRepository.existsByUserAndBottle(user, bottle)) {
            log.warn("❌ [유리병 좋아요 실패] 이미 좋아요를 누른 bottle_id={}", bottleId);
            return BottleLikeResponseDto.alreadyLiked();
        }

        BottleLike bottleLike = BottleLike.builder()
                .user(user)
                .bottle(bottle)
                .build();
        bottleLikeRepository.save(bottleLike);

        log.info("✅ [유리병 좋아요 성공] bottle_id={}, user_id={}", bottleId, userId);
        return BottleLikeResponseDto.success();
    }

    @Override
    @Transactional
    public BottleLikeResponseDto removeLike(Integer userId, Integer bottleId) {

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.error("❌ [유리병 좋아요 삭제 실패] 사용자 정보 조회 실패");
            return BottleLikeResponseDto.unauthorized();
        }
        User user = userOpt.get();

        Optional<Bottle> bottleOpt = bottleRepository.findById(bottleId);
        if (bottleOpt.isEmpty()) {
            log.warn("❌ [유리병 좋아요 삭제 실패] 존재하지 않는 bottle_id={}", bottleId);
            return BottleLikeResponseDto.bottleNotFound();
        }
        Bottle bottle = bottleOpt.get();

        Optional<BottleLike> bottleLikeOpt = bottleLikeRepository.findByUserAndBottle(user, bottle);
        if (bottleLikeOpt.isEmpty()) {
            log.warn("❌ [유리병 좋아요 삭제 실패] 좋아요를 누르지 않은 bottle_id={}", bottleId);
            return BottleLikeResponseDto.notLiked();
        }
        BottleLike bottleLike = bottleLikeOpt.get();

        bottleLikeRepository.delete(bottleLike);
        log.info("✅ [유리병 좋아요 삭제 성공] bottle_id={}, user_id={}", bottleId, userId);
        return BottleLikeResponseDto.success();
    }

    @Override
    @Transactional(readOnly = true)
    public BottleLikeCountResponseDto getLikeCount(Integer userId, Integer bottleId) {

        Optional<Bottle> bottleOpt = bottleRepository.findById(bottleId);
        if (bottleOpt.isEmpty()) {
            log.warn("❌ [유리병 좋아요 개수 조회 실패] 존재하지 않는 bottle_id={}", bottleId);
            return BottleLikeCountResponseDto.bottleNotFound();
        }
        Bottle bottle = bottleOpt.get();

        int likeCount = bottleLikeRepository.countByBottle(bottle);
        if (likeCount == 0) {
            log.info("✅ [유리병 좋아요 개수 조회] bottle_id={}, 좋아요 없음", bottleId);
            return BottleLikeCountResponseDto.noLikes(bottleId);
        }

        log.info("✅ [유리병 좋아요 개수 조회 성공] bottle_id={}, 좋아요 개수={}", bottleId, likeCount);
        return BottleLikeCountResponseDto.success(bottleId, likeCount);
    }

    @Transactional(readOnly = true)
    @Override
    public BottleLikeStatusResponseDto getLikeStatus(Integer userId, Integer bottleId) {

        if (!bottleRepository.existsById(bottleId)) {
            log.warn("❌ [좋아요 상태 조회 실패] 존재하지 않는 유리병 ID: {}", bottleId);
            return BottleLikeStatusResponseDto.bottleNotFound();
        }

        // 3. 좋아요 상태 확인
        boolean isLiked = bottleLikeRepository.existsByBottle_BottleIdAndUser_UserId(bottleId, userId);
        String status = isLiked ? "LIKED" : "NOT_LIKED";

        log.info("✅ [좋아요 상태 조회 완료] 사용자 ID: {}, 유리병 ID: {}, 상태: {}", userId, bottleId, status);
        return BottleLikeStatusResponseDto.success(bottleId, status);
    }

    @Transactional
    @Override
    public CreateMessageResponseDto createPastMessage(Integer userId, CreateMessageRequestDto request) {

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.error("❌ [유리병 작성 실패] 사용자 정보 조회 실패");
            return CreateMessageResponseDto.serverError();
        }
        User user = userOpt.get();
        Bottle bottle = bottleRepository.save(Bottle.builder()
                .user(user)
                .title(request.getTitle())
                .content(request.getContent())
                .createdAt(Instant.now().minus(10, ChronoUnit.DAYS))
                .build());

        List<String> mediaUrls = new ArrayList<>();
        if (request.getMedia() != null) {
            for (MultipartFile file : request.getMedia()) {
                String mediaUrl = awsS3Service.uploadFile(file);
                bottleMediaRepository.save(BottleMedia.builder()
                        .bottle(bottle)
                        .mediaUrl(mediaUrl)
                        .build());
                mediaUrls.add(mediaUrl);
            }
        }

        log.info("✅ [유리병 작성 완료] bottleId={}, userId={}", bottle.getBottleId(), userId);
        return CreateMessageResponseDto.success(bottle.getBottleId(), bottle.getTitle(), bottle.getCreatedAt(), mediaUrls);
    }
}
