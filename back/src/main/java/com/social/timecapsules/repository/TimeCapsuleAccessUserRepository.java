package com.social.timecapsules.repository;

import com.social.timecapsules.entity.TimeCapsule;
import com.social.timecapsules.entity.TimeCapsuleAccessUser;
import com.social.timecapsules.entity.TimeCapsuleAccessUserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Repository
public interface TimeCapsuleAccessUserRepository extends JpaRepository<TimeCapsuleAccessUser, TimeCapsuleAccessUserId> {

    // ✅ 특정 사용자가 특정 타임캡슐에 대한 접근 권한이 있는지 확인
    boolean existsByUserUserIdAndTimeCapsuleCapsuleId(@Param("userId") Integer userId, @Param("capsuleId") Integer capsuleId);

    // ✅ 특정 타임캡슐을 공유받은 사용자 목록 조회
    @Query("SELECT tua FROM TimeCapsuleAccessUser tua WHERE tua.timeCapsule.capsuleId = :capsuleId")
    List<TimeCapsuleAccessUser> findByTimeCapsuleCapsuleId(@Param("capsuleId") Integer capsuleId);



    // ✅ 수거 가능한 타임캡슐 목록 조회 (is_read = 0 && opened_at < 현재시간)
    @Query("SELECT t FROM TimeCapsule t " +
            "JOIN TimeCapsuleAccessUser tca ON t.capsuleId = tca.timeCapsule.capsuleId " +
            "WHERE tca.user.userId = :userId " +
            "AND tca.isRead = 0 " +
            "AND t.openedAt < :currentTime")
    List<TimeCapsule> findCollectableCapsules(@Param("userId") Integer userId, @Param("currentTime") Instant currentTime);

    // ✅ 수거된 타임캡슐의 is_read 값을 1로 업데이트
    @Transactional
    @Modifying
    @Query("UPDATE TimeCapsuleAccessUser tca SET tca.isRead = 1 " +
            "WHERE tca.user.userId = :userId " +
            "AND tca.timeCapsule.capsuleId IN :capsuleIds")
    void markCapsulesAsCollected(@Param("userId") Integer userId, @Param("capsuleIds") List<Integer> capsuleIds);

    @Query("SELECT t.timeCapsule.capsuleId FROM TimeCapsuleAccessUser t WHERE t.user.userId = :userId AND t.isRead = 1")
    List<Integer> findReadCapsuleIdsByUserId(Integer userId);
}


