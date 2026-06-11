package com.social.bottle.repository;

import com.social.bottle.entity.BottleComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BottleCommentRepository extends JpaRepository<BottleComment, Integer> {
    List<BottleComment> findByBottle_BottleId(Integer bottleId);

    Optional<BottleComment> findByCommentIdAndBottle_BottleId(Integer commentId, Integer bottleId);

    List<BottleComment> findByParentId_CommentId(Integer parentId);
}
