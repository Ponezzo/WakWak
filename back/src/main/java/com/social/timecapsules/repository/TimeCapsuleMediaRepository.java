package com.social.timecapsules.repository;

import com.social.timecapsules.entity.TimeCapsuleMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeCapsuleMediaRepository extends JpaRepository<TimeCapsuleMedia, Integer> {
    List<TimeCapsuleMedia> findByTimeCapsule_CapsuleId(Integer capsuleId);

    @Query("SELECT tcm.mediaUrl FROM TimeCapsuleMedia tcm WHERE tcm.timeCapsule.capsuleId = :capsuleId")
    List<String> findMediaUrlsByCapsuleId(@Param("capsuleId") Integer capsuleId);

}
