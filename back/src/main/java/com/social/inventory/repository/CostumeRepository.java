package com.social.inventory.repository;

import com.social.inventory.entity.Costume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CostumeRepository extends JpaRepository<Costume, Integer> {
    List<Costume> findByUserUserIdOrderByHasItemDescItemItemIdAsc(Integer userId);

}
