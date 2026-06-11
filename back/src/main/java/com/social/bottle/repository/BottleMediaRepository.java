package com.social.bottle.repository;

import com.social.bottle.entity.BottleMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BottleMediaRepository extends JpaRepository<BottleMedia, Integer> {

    List<BottleMedia> findByBottle_BottleId(Integer bottleId);
}
