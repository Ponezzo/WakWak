package com.social.bottle.util;

import com.social.bottle.entity.BottleComment;
import com.social.bottle.repository.BottleCommentRepository;

import java.util.List;
import java.util.Map;

public class BottleCommentDeletionHelper {

    /**
     * 해당 댓글 및 그 자손이 모두 소프트 딜리트 상태이면 true 반환.
     */
    public static boolean isEligibleForDeletion(BottleComment comment, Map<Integer, List<BottleComment>> childrenMap) {
        if (comment.getIsDeleted() != 1) {
            return false;
        }
        List<BottleComment> children = childrenMap.get(comment.getCommentId());
        if (children != null) {
            for (BottleComment child : children) {
                if (!isEligibleForDeletion(child, childrenMap)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 해당 댓글의 자손들을 바텀업 순서로 재귀적으로 수집.
     */
    public static void collectDeletableSubtree(BottleComment comment,
                                               Map<Integer, List<BottleComment>> childrenMap,
                                               List<BottleComment> deletionList) {
        List<BottleComment> children = childrenMap.get(comment.getCommentId());
        if (children != null) {
            for (BottleComment child : children) {
                if (isEligibleForDeletion(child, childrenMap)) {
                    collectDeletableSubtree(child, childrenMap, deletionList);
                    deletionList.add(child);
                }
            }
        }
    }

    /**
     * 부모 댓글을 재귀적으로 확인하여 하드 딜리트 대상이면 삭제.
     */
    public static void processParentDeletion(BottleComment parent,
                                             Map<Integer, List<BottleComment>> childrenMap,
                                             BottleCommentRepository repository) {
        if (parent == null) {
            return;
        }
        if (parent.getIsDeleted() == 1 && isEligibleForDeletion(parent, childrenMap)) {
            repository.delete(parent);
            processParentDeletion(parent.getParentId(), childrenMap, repository);
        }
    }
}
