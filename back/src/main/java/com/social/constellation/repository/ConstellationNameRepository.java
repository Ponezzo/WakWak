package com.social.constellation.repository;

import com.social.constellation.entity.ConstellationName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ConstellationNameRepository extends JpaRepository<ConstellationName, Integer> {



    @Transactional
    @Modifying
    @Query(value = "DELETE FROM constellation_name WHERE constellation_id IN (SELECT constellation_id FROM constellation WHERE star_id = :starId)", nativeQuery = true)
    void deleteByStarId(Integer starId);
}