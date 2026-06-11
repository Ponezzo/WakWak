package com.social.bottle.repository;

import com.social.bottle.entity.Bottle;
import com.social.bottle.entity.BottleLike;
import com.social.login.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BottleLikeRepository extends JpaRepository<BottleLike, Integer> {

    @Query("SELECT COUNT(b) FROM BottleLike b WHERE b.bottle.bottleId = :bottleId")
    int countLikes(@Param("bottleId") Integer bottleId);

    boolean existsByUserAndBottle(User user, Bottle bottle);

    Optional<BottleLike> findByUserAndBottle(User user, Bottle bottle);

    int countByBottle(Bottle bottle);

    boolean existsByBottle_BottleIdAndUser_UserId(Integer bottleId, Integer userId);
}
