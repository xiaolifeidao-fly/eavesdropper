package com.kakrolot.service.shop.api;

import com.kakrolot.service.shop.api.dto.ShopCategoryChangeDTO;

import java.util.List;

public interface ShopCategoryChangeService {

    void save(ShopCategoryChangeDTO shopCategoryChangeDTO);

    ShopCategoryChangeDTO findById(Long id);

    List<ShopCategoryChangeDTO> findAllByUserId(Long userId);

}
