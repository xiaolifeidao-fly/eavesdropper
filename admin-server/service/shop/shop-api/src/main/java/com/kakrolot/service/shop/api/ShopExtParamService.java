package com.kakrolot.service.shop.api;

import com.kakrolot.service.shop.api.dto.ShopExtParamDTO;

import java.util.List;

public interface ShopExtParamService {

    ShopExtParamDTO getById(Long id);

    List<ShopExtParamDTO> findByShopId(Long shopId);

    List<ShopExtParamDTO> findAll();

}
