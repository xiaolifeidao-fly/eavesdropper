package com.kakrolot.service.shop;

import com.kakrolot.common.utils.Constant;
import com.kakrolot.service.shop.api.TenantShopCategoryService;
import com.kakrolot.service.shop.api.dto.TenantShopCategoryDTO;
import com.kakrolot.service.shop.convert.TenantShopCategoryConverter;
import com.kakrolot.service.shop.dao.po.TenantShopCategory;
import com.kakrolot.service.shop.dao.repository.TenantShopCategoryRepository;
import com.kakrolot.service.tenant.api.TenantService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class TenantShopCategoryServiceImpl implements TenantShopCategoryService {

    @Autowired
    private TenantShopCategoryConverter tenantShopCategoryConverter;

    @Autowired
    private TenantShopCategoryRepository tenantShopCategoryRepository;

    @Autowired
    private TenantService tenantService;

    @Override
    public List<TenantShopCategoryDTO> findByTenantIds(List<Long> tenantIds){
        List<TenantShopCategory> tenantShopCategoryList = tenantShopCategoryRepository.findByTenantIdIn(tenantIds);
        return tenantShopCategoryConverter.toDTOs(tenantShopCategoryList);
    }

    @Override
    public List<TenantShopCategoryDTO> findByTenantIdsAndShopCategoryId(List<Long> tenantIds, Long shopCategoryId) {
        List<TenantShopCategory> tenantShopCategoryList = tenantShopCategoryRepository.findByTenantIdInAndShopCategoryId(tenantIds, shopCategoryId);
        return tenantShopCategoryConverter.toDTOs(tenantShopCategoryList);
    }

    @Override
    @Transactional
    public void saveTenantShopCategory(List<Long> shopCategoryIds, Long tenantId){
        tenantShopCategoryRepository.deleteAllByTenantId(tenantId);
        if (CollectionUtils.isEmpty(shopCategoryIds)) {
            return;
        }
        for (Long shopCategoryId : shopCategoryIds) {
            TenantShopCategory tenantShopCategory = new TenantShopCategory();
            tenantShopCategory.setTenantId(tenantId);
            tenantShopCategory.setShopCategoryId(shopCategoryId);
            tenantShopCategory.setActive(Constant.ACTIVE);
            tenantShopCategoryRepository.save(tenantShopCategory);
        }
    }

    @Override
    public TenantShopCategoryDTO findById(Long tenantShopCategoryId) {
        TenantShopCategory tenantShopCategory = tenantShopCategoryRepository.getById(tenantShopCategoryId);
        return tenantShopCategoryConverter.toDTO(tenantShopCategory);
    }

}
