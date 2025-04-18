package com.kakrolot.service.shop.api;

import com.kakrolot.service.shop.api.dto.TenantShopDTO;

import java.util.List;

public interface TenantShopService {

    List<TenantShopDTO> findByTenantIds(List<Long> tenantIds);

    List<TenantShopDTO> findByTenantIdsAndShopId(List<Long> tenantIds, Long shopId);

    void saveTenantShop(List<Long> shopIds, Long tenantId);

    TenantShopDTO findById(Long tenantShopId);
}
