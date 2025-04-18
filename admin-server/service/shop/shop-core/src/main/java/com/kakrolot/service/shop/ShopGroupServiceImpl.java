package com.kakrolot.service.shop;

import com.kakrolot.service.shop.api.ShopGroupService;
import com.kakrolot.service.shop.api.dto.ShopGroupDTO;
import com.kakrolot.service.shop.convert.ShopGroupConverter;
import com.kakrolot.service.shop.dao.po.ShopGroup;
import com.kakrolot.service.shop.dao.repository.ShopGroupRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by roc_peng on 2020/7/7.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Slf4j
@Service
public class ShopGroupServiceImpl implements ShopGroupService {

    @Autowired
    private ShopGroupRepository shopGroupRepository;

    @Autowired
    private ShopGroupConverter shopGroupConverter;

    @Override
    public void save(ShopGroupDTO shopGroupDTO) {
        ShopGroup shopGroup = shopGroupConverter.toPo(shopGroupDTO);
        shopGroupRepository.save(shopGroup);
    }

    @Override
    public ShopGroupDTO findById(Long shopGroupId) {
        ShopGroup shopGroup = shopGroupRepository.getById(shopGroupId);
        return shopGroupConverter.toDTO(shopGroup);
    }

    @Override
    public ShopGroupDTO findByBusinessType(String businessType) {
        ShopGroup shopGroup = shopGroupRepository.findByBusinessType(businessType);
        return shopGroupConverter.toDTO(shopGroup);
    }

    @Override
    public List<ShopGroupDTO> findAllByBusinessCode(String businessCode) {
        List<ShopGroup> shopGroupList = shopGroupRepository.findAllByBusinessCode(businessCode);
        return shopGroupConverter.toDTOs(shopGroupList);
    }

    @Override
    public List<ShopGroupDTO> findBySettleFlag(boolean settleFlag) {
        List<ShopGroup> shopGroupList = shopGroupRepository.findBySettleFlag(settleFlag);
        return shopGroupConverter.toDTOs(shopGroupList);
    }

    @Override
    public List<ShopGroupDTO> findByDashBoardActive(boolean dashBoardActive) {
        List<ShopGroup> shopGroupList = shopGroupRepository.findByDashboardActive(dashBoardActive);
        return shopGroupConverter.toDTOs(shopGroupList);
    }
}
