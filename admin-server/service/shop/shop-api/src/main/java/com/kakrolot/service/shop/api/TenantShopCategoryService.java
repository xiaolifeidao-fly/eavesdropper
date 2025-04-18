package com.kakrolot.service.shop.api;

import com.kakrolot.service.shop.api.dto.TenantShopCategoryDTO;

import java.util.List;

public interface TenantShopCategoryService {

    List<TenantShopCategoryDTO> findByTenantIds(List<Long> tenantIds);

    List<TenantShopCategoryDTO> findByTenantIdsAndShopCategoryId(List<Long> tenantIds, Long shopCategoryId);

    void saveTenantShopCategory(List<Long> shopCategoryIds, Long tenantId);

    TenantShopCategoryDTO findById(Long tenantShopCategoryId);
}
