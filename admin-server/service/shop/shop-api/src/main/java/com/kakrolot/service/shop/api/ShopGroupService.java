package com.kakrolot.service.shop.api;

import com.kakrolot.service.shop.api.dto.ShopGroupDTO;

import java.util.List;

public interface ShopGroupService {

    void save(ShopGroupDTO shopGroupDTO);

    ShopGroupDTO findById(Long shopGroupId);

    ShopGroupDTO findByBusinessType(String businessType);

    List<ShopGroupDTO> findAllByBusinessCode(String businessCode);

    List<ShopGroupDTO> findBySettleFlag(boolean settleFlag);

    List<ShopGroupDTO> findByDashBoardActive(boolean dashBoardActive);

}
