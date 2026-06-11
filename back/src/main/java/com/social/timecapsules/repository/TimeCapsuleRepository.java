package com.social.timecapsules.repository;

import com.social.timecapsules.entity.TimeCapsule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface TimeCapsuleRepository extends JpaRepository<TimeCapsule, Integer> {

    @Query("SELECT tc FROM TimeCapsule tc " +
            "JOIN TimeCapsuleAccessUser tcau ON tc.capsuleId = tcau.timeCapsule.capsuleId " +
            "WHERE tcau.user.userId = :userId " +
            "AND tc.longitude BETWEEN :left AND :right " +
            "AND tc.latitude BETWEEN :down AND :up")
    List<TimeCapsule> findAccessibleCapsulesInBounds(
            @Param("userId") Integer userId,
            @Param("left") Double left,
            @Param("right") Double right,
            @Param("up") Double up,
            @Param("down") Double down
    );

    // ✅ 특정 사용자가 접근 가능한 타임캡슐 목록 조회
    @Query("SELECT tc FROM TimeCapsule tc " +
            "JOIN TimeCapsuleAccessUser tcau ON tc.capsuleId = tcau.timeCapsule.capsuleId " +
            "WHERE tcau.user.userId = :userId")
    List<TimeCapsule> findAccessibleTimeCapsules(@Param("userId") Integer userId);

    @Query("SELECT tc FROM TimeCapsule tc WHERE tc.capsuleId = :capsuleId")
    Optional<TimeCapsule> findByCapsuleId(@Param("capsuleId") Integer capsuleId);

    // ✅ 특정 사용자가 소유한 타임캡슐인지 확인
    boolean existsByCapsuleIdAndUserUserId(Integer capsuleId, Integer userId);

    // ✅ 타임캡슐 삭제
    @Transactional
    @Modifying
    @Query("DELETE FROM TimeCapsule tc WHERE tc.capsuleId = :capsuleId")
    void deleteByCapsuleId(@Param("capsuleId") Integer capsuleId);

    List<TimeCapsule> findByCapsuleIdInOrderByOpenedAtDesc(List<Integer> capsuleIds);
}
