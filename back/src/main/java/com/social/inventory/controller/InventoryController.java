package com.social.inventory.controller;

import com.social.inventory.dto.request.ClothesInventoryRequestDto;
import com.social.inventory.dto.response.ClothesInventoryResponseDto;
import com.social.inventory.dto.response.GetClothesInventoryResponseDto;
import com.social.inventory.dto.response.TimeCapsuleInventoryResponseDto;
import com.social.inventory.service.InventoryService;
import com.social.login.util.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/clothes")
    public ResponseEntity<GetClothesInventoryResponseDto> getClothesInventory(
            HttpServletRequest request) {

        Integer userId = UserContext.getUserId(request);
        GetClothesInventoryResponseDto response = inventoryService.getClothesInventory(userId);

        if ("SUCCESS".equals(response.getCode())) {
            log.info("✅ [옷 조회 성공] 조회된 아이템 수={}", response.getData().size());
            return ResponseEntity.ok(response);
        } else {
            log.warn("❌ [옷 조회 실패] 이유: {}", response.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @GetMapping("/detail")
    public ResponseEntity<ClothesInventoryResponseDto> getClothesDetail(
            HttpServletRequest request,
            @ModelAttribute @Valid ClothesInventoryRequestDto requestDto) {
        Integer userId = UserContext.getUserId(request);
        ClothesInventoryResponseDto response = inventoryService.getClothesDetail(userId, requestDto.getItemId());

        if ("SUCCESS".equals(response.getCode())) {
            log.info("✅ [조회 성공] item_id: {}", requestDto.getItemId());
            return ResponseEntity.ok(response);
        } else {
            log.warn("❌ [조회 실패] item_id: {}, 이유: {}", requestDto.getItemId(), response.getMessage());
            return ResponseEntity.status(404).body(response);
        }
    }

    @GetMapping("/time-capsules")
    public ResponseEntity<TimeCapsuleInventoryResponseDto> getReadTimeCapsules(
            HttpServletRequest request) {

        Integer userId = UserContext.getUserId(request);
        TimeCapsuleInventoryResponseDto response = inventoryService.getReadTimeCapsules(userId);

        if ("SUCCESS".equals(response.getCode())) {
            log.info("✅ [조회 성공] {}개의 타임캡슐 반환", response.getData().size());
            return ResponseEntity.ok(response);
        } else {
            log.warn("❌ [조회 실패] 이유: {}", response.getMessage());
            return ResponseEntity.status(401).body(response);
        }
    }
}
