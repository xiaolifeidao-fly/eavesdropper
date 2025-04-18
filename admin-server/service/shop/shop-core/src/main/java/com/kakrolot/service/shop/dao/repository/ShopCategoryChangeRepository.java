package com.kakrolot.service.shop.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.shop.dao.po.ShopCategoryChange;

import java.util.List;

public interface ShopCategoryChangeRepository extends CommonRepository<ShopCategoryChange, Long> {

    ShopCategoryChange getById(Long id);

    List<ShopCategoryChange> findAllByUserId(Long userId);

}
