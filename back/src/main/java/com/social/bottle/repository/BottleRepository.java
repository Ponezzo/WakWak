package com.social.bottle.repository;

import com.social.bottle.entity.Bottle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface BottleRepository extends JpaRepository<Bottle, Integer> {

    @Query("SELECT b FROM Bottle b WHERE b.user.userId <> :userId AND b.createdAt > :twentyFourHoursAgo")
    List<Bottle> findAvailableBottles(@Param("userId") Integer userId,
                                      @Param("twentyFourHoursAgo") Instant twentyFourHoursAgo);

    @Query("SELECT b FROM Bottle b WHERE b.user.userId = :userId AND b.createdAt <= :twentyFourHoursAgo ORDER BY b.createdAt DESC")
    List<Bottle> findExpiredBottles(@Param("userId") Integer userId,
                                    @Param("twentyFourHoursAgo") Instant twentyFourHoursAgo);

    @Query("SELECT b FROM Bottle b WHERE b.bottleId = :bottleId")
    Optional<Bottle> findById(@Param("bottleId") Integer bottleId);

    @Query("SELECT b FROM Bottle b WHERE b.bottleId = :bottleId AND b.user.userId = :userId")
    Optional<Bottle> findByIdAndUserId(@Param("bottleId") Integer bottleId, @Param("userId") Integer userId);
}