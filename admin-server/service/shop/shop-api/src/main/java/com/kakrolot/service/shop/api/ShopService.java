package com.kakrolot.service.shop.api;

import com.kakrolot.service.shop.api.dto.ShopDTO;

import java.util.List;

public interface ShopService {

    ShopDTO findByCode(String code);

    void save(ShopDTO shopDTO);

    ShopDTO findById(Long shopId);

    List<ShopDTO> getAll();

    List<ShopDTO> getAllActive();

    List<ShopDTO> getAllActiveFromBarry();

    List<ShopDTO> findByIdsAndActive(List<Long> ids);

    List<ShopDTO> findAllByShopGroupId(Long shopGroupId);

    List<ShopDTO> findAllByBusinessType(String businessType);

    List<ShopDTO> findAllByBusinessCode(String businessCode);

}
