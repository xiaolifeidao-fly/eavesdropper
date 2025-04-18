package com.kakrolot.service.shop.api;

import com.kakrolot.service.shop.api.dto.ManualShopCategoryDTO;

import java.util.List;

public interface ManualShopService {

    List<ManualShopCategoryDTO> findManualShopCategories();

    List<Long> saveManualShopCategory(ManualShopCategoryDTO manualShopCategoryDTO);

    List<Long> deleteManualShopCategory(ManualShopCategoryDTO manualShopCategoryDTO);

    Long expireManualShopCategory(ManualShopCategoryDTO manualShopCategoryDTO);

    Long activeManualShopCategory(ManualShopCategoryDTO manualShopCategoryDTO);

}
