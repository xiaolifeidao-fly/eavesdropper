package com.kakrolot.service.shop.api;

import com.kakrolot.service.shop.api.dto.QueryShopCategoryDTO;
import com.kakrolot.service.shop.api.dto.ShopCategoryDTO;

import java.util.List;

public interface ShopCategoryService {

    void save(ShopCategoryDTO dbShopCategoryDTO);

    ShopCategoryDTO findById(Long id);

    List<ShopCategoryDTO> findAllByActive();

    List<ShopCategoryDTO> findByShopId(Long shopId);

    List<ShopCategoryDTO> findByShopIdsIn(List<Long> shopIds);

    Long countByCondition(QueryShopCategoryDTO queryShopCategoryDTO);

    List<ShopCategoryDTO> findByCondition(QueryShopCategoryDTO queryShopCategoryDTO);

    ShopCategoryDTO findByShopIdAndSecretKey(Long shopId, String secretKey);

    ShopCategoryDTO findBySecretKey(String secretKey);

    List<ShopCategoryDTO> findByIdsAndActive(List<Long> ids);
}
