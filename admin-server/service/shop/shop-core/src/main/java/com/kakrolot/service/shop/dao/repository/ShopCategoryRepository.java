package com.kakrolot.service.shop.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.shop.dao.po.ShopCategory;

import java.util.List;

public interface ShopCategoryRepository extends CommonRepository<ShopCategory, Long> {

    ShopCategory getById(Long id);

    List<ShopCategory> findAllByActive(Boolean active);

    List<ShopCategory> findAllByShopIdAndActive(Long shopId, Boolean active);

    List<ShopCategory> findAllByShopIdInAndActive(List<Long> shopIds, Boolean active);

    ShopCategory findByShopIdAndSecretKey(Long shopId, String secretKey);

    ShopCategory findBySecretKey(String code);

    List<ShopCategory> findByIdInAndActive(List<Long> ids, Boolean active);

}
