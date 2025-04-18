package com.kakrolot.service.shop;

import com.kakrolot.common.utils.Constant;
import com.kakrolot.service.shop.api.ShopCategoryChangeService;
import com.kakrolot.service.shop.api.dto.QueryShopCategoryDTO;
import com.kakrolot.service.shop.api.dto.ShopCategoryChangeDTO;
import com.kakrolot.service.shop.api.dto.ShopCategoryDTO;
import com.kakrolot.service.shop.convert.ShopCategoryChangeConverter;
import com.kakrolot.service.shop.dao.po.ShopCategory;
import com.kakrolot.service.shop.dao.po.ShopCategoryChange;
import com.kakrolot.service.shop.dao.repository.ShopCategoryChangeRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ShopCategoryChangeServiceImpl implements ShopCategoryChangeService {

    @Autowired
    private ShopCategoryChangeConverter shopCategoryChangeConverter;

    @Autowired
    private ShopCategoryChangeRepository shopCategoryChangeRepository;

    @Override
    public void save(ShopCategoryChangeDTO shopCategoryChangeDTO) {
        ShopCategoryChange shopCategoryChange = shopCategoryChangeConverter.toPo(shopCategoryChangeDTO);
        shopCategoryChangeRepository.save(shopCategoryChange);
    }

    @Override
    public ShopCategoryChangeDTO findById(Long id) {
        ShopCategoryChange shopCategoryChange = shopCategoryChangeRepository.getById(id);
        return shopCategoryChangeConverter.toDTO(shopCategoryChange);
    }

    @Override
    public List<ShopCategoryChangeDTO> findAllByUserId(Long userId) {
        List<ShopCategoryChange> shopCategoryChanges = shopCategoryChangeRepository.findAllByUserId(userId);
        return shopCategoryChangeConverter.toDTOs(shopCategoryChanges);
    }

}
