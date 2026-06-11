package com.social.inventory.repository;

import com.social.inventory.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Integer> {
    Optional<Item> findByItemId(Integer itemId);
}
