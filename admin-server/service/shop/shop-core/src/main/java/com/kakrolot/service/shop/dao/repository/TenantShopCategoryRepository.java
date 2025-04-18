package com.kakrolot.service.shop.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.shop.dao.po.TenantShopCategory;

import java.util.List;

public interface TenantShopCategoryRepository extends CommonRepository<TenantShopCategory, Long> {

    List<TenantShopCategory> findByTenantIdIn(List<Long> tenantIds);

    void deleteAllByTenantId(Long tenantId);

    List<TenantShopCategory> findAllByTenantIdInAndActive(List<Long> tenantIds, Boolean active);

    List<TenantShopCategory> findAllByTenantIdAndActive(Long tenantId, Boolean active);

    TenantShopCategory getById(Long tenantShopCategoryId);

    List<TenantShopCategory> findByTenantIdInAndShopCategoryId(List<Long> tenantIds, Long shopCategoryId);
}
