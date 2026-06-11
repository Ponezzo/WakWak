package com.social.constellation.repository;

import com.social.constellation.entity.Constellation;
import com.social.constellation.entity.ConstellationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

@Repository
public interface ConstellationRepository extends JpaRepository<Constellation, ConstellationId> {

    // 특정 `constellation_id`와 연결된 `constellation` 찾기
    List<Constellation> findByConstellationName_ConstellationId(Integer constellationId);

    // 특정 `constellation_id`와 연결된 `constellation` 삭제
    @Transactional
    void deleteByConstellationName_ConstellationId(Integer constellationId);

    List<Constellation> findByStar_StarIdIn(Collection<Integer> starStarIds);


    @Query("SELECT c.starOrder FROM Constellation c WHERE c.star.starId = :starId AND c.constellationName.constellationId = :constellationId")
    Integer findStarOrder(@Param("starId") int starId, @Param("constellationId") int constellationId);
}
