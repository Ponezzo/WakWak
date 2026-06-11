package com.social.inventory.service;

import com.social.inventory.dto.response.ClothesInventoryResponseDto;
import com.social.inventory.dto.response.GetClothesInventoryResponseDto;
import com.social.inventory.dto.response.TimeCapsuleInventoryResponseDto;

public interface InventoryService {
    GetClothesInventoryResponseDto getClothesInventory(Integer userId);

    ClothesInventoryResponseDto getClothesDetail(Integer userId, Integer itemId);

    TimeCapsuleInventoryResponseDto getReadTimeCapsules(Integer userId);
}
