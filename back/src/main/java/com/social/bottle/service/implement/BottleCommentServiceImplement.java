package com.social.bottle.service.implement;

import com.social.bottle.dto.request.BottleCommentRequestDto;
import com.social.bottle.dto.request.DeleteBottleCommentRequestDto;
import com.social.bottle.dto.response.BottleCommentResponseDto;
import com.social.bottle.dto.response.DeleteBottleCommentResponseDto;
import com.social.bottle.dto.response.GetBottleCommentResponseDto;
import com.social.bottle.entity.Bottle;
import com.social.bottle.entity.BottleComment;
import com.social.bottle.repository.BottleCommentRepository;
import com.social.bottle.repository.BottleRepository;
import com.social.bottle.service.BottleCommentService;
import com.social.login.entity.User;
import com.social.login.repository.UserRepository;
import com.social.bottle.util.BottleCommentTreeBuilder;
import com.social.bottle.util.BottleCommentDeletionHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BottleCommentServiceImplement implements BottleCommentService {

    private final BottleRepository bottleRepository;
    private final BottleCommentRepository bottleCommentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public BottleCommentResponseDto addComment(Integer userId, BottleCommentRequestDto requestDto) {

        Optional<Bottle> bottleOpt = bottleRepository.findById(requestDto.getBottleId());
        if (bottleOpt.isEmpty()) {
            log.warn("[댓글 작성 실패] 존재하지 않는 bottle_id={}", requestDto.getBottleId());
            return BottleCommentResponseDto.bottleNotFound();
        }
        Bottle bottle = bottleOpt.get();

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.warn("[댓글 작성 실패] 존재하지 않는 userId={}", userId);
            return BottleCommentResponseDto.unauthorized();
        }
        User user = userOpt.get();

        BottleComment parentComment = null;
        if (requestDto.getParentId() != null) {
            Optional<BottleComment> parentOpt = bottleCommentRepository.findById(requestDto.getParentId());
            if (parentOpt.isEmpty()) {
                log.warn("[댓글 작성 실패] 존재하지 않는 parent_id={}", requestDto.getParentId());
                return BottleCommentResponseDto.parentCommentNotFound();
            }
            parentComment = parentOpt.get();
        }

        BottleComment newComment = BottleComment.builder()
                .bottle(bottle)
                .user(user)
                .parentId(parentComment)
                .content(requestDto.getContent())
                .createdAt(Instant.now())
                .isDeleted(0)  // 0: 삭제되지 않음
                .build();
        bottleCommentRepository.save(newComment);

        log.info("[댓글 작성 성공] commentId={}, bottleId={}, userId={}", newComment.getCommentId(), bottle.getBottleId(), userId);
        return BottleCommentResponseDto.success(
                BottleCommentResponseDto.Data.builder()
                        .commentId(newComment.getCommentId())
                        .bottleId(bottle.getBottleId())
                        .userId(userId)
                        .parentId(requestDto.getParentId())
                        .content(requestDto.getContent())
                        .createdAt(newComment.getCreatedAt())
                        .isDeleted(false)
                        .build());
    }

    @Override
    @Transactional
    public GetBottleCommentResponseDto getComments(Integer userId, Integer bottleId) {
        log.info("[댓글 조회 요청] bottle_id: {}", bottleId);

        if (bottleId == null) {
            log.warn("[유효성 검사 실패] bottle_id 누락");
            return GetBottleCommentResponseDto.missingBottleId();
        }
        if (!bottleRepository.existsById(bottleId)) {
            log.warn("[BOTTLE NOT FOUND] 존재하지 않는 bottle_id: {}", bottleId);
            return GetBottleCommentResponseDto.bottleNotFound();
        }

        List<BottleComment> comments = bottleCommentRepository.findByBottle_BottleId(bottleId);
        if (comments.isEmpty()) {
            log.info("[댓글 없음] bottle_id: {} 에 댓글 없음", bottleId);
            return GetBottleCommentResponseDto.noComments();
        }
        log.info("[댓글 수집] {}개의 댓글 조회됨", comments.size());

        // 트리 구성은 별도 유틸(BottleCommentTreeBuilder)에 위임
        List<GetBottleCommentResponseDto.Data> dataList = BottleCommentTreeBuilder.buildTree(comments);
        log.info("[댓글 조회 성공] bottle_id: {}, 총 댓글 반환 수: {}", bottleId, dataList.size());
        return GetBottleCommentResponseDto.success(dataList);
    }

    @Override
    @Transactional
    public DeleteBottleCommentResponseDto deleteComment(Integer userId, DeleteBottleCommentRequestDto requestDto) {
        log.info("[DELETE COMMENT] 요청 수신 - bottle_id: {}, comment_id: {}",
                requestDto.getBottleId(), requestDto.getCommentId());


        Optional<BottleComment> targetOpt = bottleCommentRepository.findByCommentIdAndBottle_BottleId(
                requestDto.getCommentId(), requestDto.getBottleId());
        if (targetOpt.isEmpty()) {
            log.warn("[COMMENT NOT FOUND] 존재하지 않는 댓글 - bottle_id: {}, comment_id: {}",
                    requestDto.getBottleId(), requestDto.getCommentId());
            return DeleteBottleCommentResponseDto.commentNotFound();
        }
        BottleComment target = targetOpt.get();
        Bottle bottle = target.getBottle();

        if (!bottle.getUser().getUserId().equals(userId)) {
            log.warn("[ACCESS DENIED] 유저 {}가 bottle_id {}의 댓글 삭제 권한 없음", userId, requestDto.getBottleId());
            return DeleteBottleCommentResponseDto.notBottleOwner();
        }

        // 소프트 딜리트 처리
        target.setIsDeleted(1);
        bottleCommentRepository.save(target);
        log.info("[SOFT DELETE] 댓글 {} is_deleted = 1", target.getCommentId());

        List<BottleComment> allComments = bottleCommentRepository.findByBottle_BottleId(requestDto.getBottleId());
        if (allComments.isEmpty()) {
            log.info("[댓글 없음] bottle_id: {} 에 댓글 없음", requestDto.getBottleId());
            return DeleteBottleCommentResponseDto.noComments();
        }
        Map<Integer, List<BottleComment>> childrenMap = new HashMap<>();
        for (BottleComment comment : allComments) {
            if (comment.getParentId() != null) {
                int parentId = comment.getParentId().getCommentId();
                childrenMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(comment);
            }
        }

        List<BottleComment> deletionList = new ArrayList<>();
        if (BottleCommentDeletionHelper.isEligibleForDeletion(target, childrenMap)) {
            BottleCommentDeletionHelper.collectDeletableSubtree(target, childrenMap, deletionList);
            deletionList.add(target);
            bottleCommentRepository.deleteAll(deletionList);
            log.info("[HARD DELETE] 타겟 댓글 {} 및 자손 {}개 삭제됨", target.getCommentId(), deletionList.size() - 1);
            BottleCommentDeletionHelper.processParentDeletion(target.getParentId(), childrenMap, bottleCommentRepository);
        } else {
            log.info("[DELETE SKIPPED] 타겟 댓글 {}의 자손 중 삭제되지 않은 댓글 있음", target.getCommentId());
        }
        return DeleteBottleCommentResponseDto.success(target.getCommentId());
    }
}
