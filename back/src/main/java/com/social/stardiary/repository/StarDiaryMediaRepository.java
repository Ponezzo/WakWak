package com.social.stardiary.repository;

import com.social.stardiary.entity.StarDiaryMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface StarDiaryMediaRepository extends JpaRepository<StarDiaryMedia, Integer> {
    List<StarDiaryMedia> findByStar_StarId(Integer starId);

    // ✅ 특정 별(starId)의 S3 저장 URL 목록 조회
    @Query("SELECT sdm.mediaUrl FROM StarDiaryMedia sdm WHERE sdm.star.starId = :starId")
    List<String> findMediaUrlsByStarId(@Param("starId") Integer starId);

    @Modifying
    @Transactional
    @Query("DELETE FROM StarDiaryMedia sdm WHERE sdm.star.starId = :starId")
    void deleteByStarId(@Param("starId") Integer starId);
}
