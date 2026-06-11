package com.social.stardiary.repository;

import com.social.stardiary.entity.Star;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface StarRepository extends JpaRepository<Star, Integer> {

    @Transactional
    void deleteByStarId(Integer starId); // ✅ `DELETE FROM star WHERE star_id = ?` 실행

    List<Star> findByStarSky_SkyId(Integer skyId);
}
