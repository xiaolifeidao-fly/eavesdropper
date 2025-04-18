package com.kakrolot.service.shop.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.shop.dao.po.TenantShop;

import java.util.List;

public interface TenantShopRepository extends CommonRepository<TenantShop, Long> {

    List<TenantShop> findByTenantIdIn(List<Long> tenantIds);

    void deleteAllByTenantId(Long tenantId);

    List<TenantShop> findAllByTenantIdInAndActive(List<Long> tenantIds, Boolean active);

    List<TenantShop> findAllByTenantIdAndActive(Long tenantId, Boolean active);

    TenantShop getById(Long tenantShopId);

    List<TenantShop> findByTenantIdInAndShopId(List<Long> tenantIds, Long shopId);
}
