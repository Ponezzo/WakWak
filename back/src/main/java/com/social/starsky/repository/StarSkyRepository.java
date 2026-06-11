package com.social.starsky.repository;

import com.social.starsky.entity.StarSky;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StarSkyRepository extends JpaRepository<StarSky, Integer> {

    @Query(value = "SELECT MIN(sky_id) FROM star_sky WHERE user_id = :userId", nativeQuery = true)
    Integer findMinStarskyIdByUserId(@Param("userId") int userId);



    List<StarSky> findByUser_UserId(Integer userUserId);

    // ✅ 특정 사용자가 특정 sky_id를 소유하고 있는지 확인
    boolean existsByUser_UserIdAndSkyId(Integer userId, Integer skyId);

    // ✅ star_id를 통해 sky_id 조회
    @Query("SELECT s.starSky.skyId FROM Star s WHERE s.starId = :starId")
    Integer findSkyIdByStarId(Integer starId);

    @Query("SELECT s FROM StarSky s WHERE s.skyId = :skyId AND s.user.userId = :userId")
    Optional<StarSky> findByUserIdAndStarSkyId(@Param("userId") Integer userId, @Param("skyId") Integer skyId);
}
