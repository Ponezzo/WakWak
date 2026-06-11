package com.social.bottle.util;

import com.social.bottle.dto.response.GetBottleCommentResponseDto;
import com.social.bottle.entity.BottleComment;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class BottleCommentTreeBuilder {

    /**
     * 전체 댓글 목록으로부터 계층적(트리) DTO 리스트를 구성한다.
     */
    public static List<GetBottleCommentResponseDto.Data> buildTree(List<BottleComment> comments) {
        // 자식 댓글들을 parent_id 기준으로 그룹핑
        Map<Integer, List<BottleComment>> childrenMap = comments.stream()
                .filter(comment -> comment.getParentId() != null)
                .collect(Collectors.groupingBy(comment -> comment.getParentId().getCommentId()));

        // 최상위 댓글 추출
        List<BottleComment> topLevelComments = comments.stream()
                .filter(comment -> comment.getParentId() == null)
                .collect(Collectors.toList());

        // 정렬: 각 레벨 내에서 commentId 오름차순 정렬
        topLevelComments.sort(Comparator.comparingInt(BottleComment::getCommentId));
        childrenMap.values().forEach(list -> list.sort(Comparator.comparingInt(BottleComment::getCommentId)));

        List<GetBottleCommentResponseDto.Data> result = new ArrayList<>();
        traverse(topLevelComments, childrenMap, result, 0);
        return result;
    }

    private static void traverse(List<BottleComment> comments,
                                 Map<Integer, List<BottleComment>> childrenMap,
                                 List<GetBottleCommentResponseDto.Data> result,
                                 int depth) {
        for (BottleComment comment : comments) {
            GetBottleCommentResponseDto.Data dto = GetBottleCommentResponseDto.Data.builder()
                    .commentId(comment.getCommentId())
                    .bottleId(comment.getBottle().getBottleId())
                    .userId(comment.getUser().getUserId())
                    .nickname(comment.getUser().getNickname())
                    .parentId(comment.getParentId() != null ? comment.getParentId().getCommentId() : null)
                    .content(comment.getContent())
                    .createdAt(comment.getCreatedAt())
                    .isDeleted(comment.getIsDeleted() != 0)
                    .depth(depth)
                    .build();
            result.add(dto);

            List<BottleComment> children = childrenMap.get(comment.getCommentId());
            if (children != null) {
                traverse(children, childrenMap, result, depth + 1);
            }
        }
    }
}
