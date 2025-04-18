package com.kakrolot.service.shop;

import com.kakrolot.service.shop.api.ShopExtParamService;
import com.kakrolot.service.shop.api.dto.ShopExtParamDTO;
import com.kakrolot.service.shop.convert.ShopExtParamConverter;
import com.kakrolot.service.shop.dao.po.ShopExtParam;
import com.kakrolot.service.shop.dao.repository.ShopExtParamRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by roc_peng on 2020/12/7.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Slf4j
@Service
public class ShopExtParamServiceImpl implements ShopExtParamService {

    @Autowired
    private ShopExtParamRepository shopExtParamRepository;

    @Autowired
    private ShopExtParamConverter shopExtParamConverter;


    @Override
    public ShopExtParamDTO getById(Long id) {
        ShopExtParam shopExtParam = shopExtParamRepository.getById(id);
        return shopExtParamConverter.toDTO(shopExtParam);
    }

    @Override
    public List<ShopExtParamDTO> findByShopId(Long shopId) {
        List<ShopExtParam> shopExtParamList = shopExtParamRepository.findByShopId(shopId);
        return shopExtParamConverter.toDTOs(shopExtParamList);
    }

    @Override
    public List<ShopExtParamDTO> findAll() {
        List<ShopExtParam> all = shopExtParamRepository.findAll();
        return shopExtParamConverter.toDTOs(all);
    }
}
