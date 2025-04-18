package com.kakrolot.web.convert.tenant;

import com.kakrolot.service.shop.api.ShopCategoryService;
import com.kakrolot.service.shop.api.TenantShopCategoryService;
import com.kakrolot.service.shop.api.dto.ShopCategoryDTO;
import com.kakrolot.service.shop.api.dto.TenantShopCategoryDTO;
import com.kakrolot.service.tenant.api.dto.TenantDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.convert.shop.ShopCategoryWebConvert;
import com.kakrolot.web.model.tenant.TenantModel;
import com.kakrolot.web.model.tenant.TenantModelResponse;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TenantWebConverter extends WebConvert<TenantDTO, TenantModel> {

    @Autowired
    private ShopCategoryService shopCategoryService;

    @Autowired
    private TenantShopCategoryService tenantShopCategoryService;

    @Autowired
    private ShopCategoryWebConvert shopCategoryWebConvert;

    public TenantModelResponse translateDTOToModel( List<TenantDTO> tenantDTOs) {
        List<TenantModel> tenantModelList = tenantDTOs.stream().map(tenantDTO -> {
            TenantModel tenantModel = new TenantModel();
            tenantModel.setId(tenantDTO.getId());
            tenantModel.setCode(tenantDTO.getCode());
            tenantModel.setName(tenantDTO.getName());
            List<TenantShopCategoryDTO> tenantShopCategoryDTOList = tenantShopCategoryService.findByTenantIds(Arrays.asList(tenantDTO.getId()));
            if(CollectionUtils.isNotEmpty(tenantShopCategoryDTOList)) {
                List<Long> shopCategoryIds = tenantShopCategoryDTOList.stream().map(TenantShopCategoryDTO::getShopCategoryId).collect(Collectors.toList());
                List<ShopCategoryDTO> shopCategoryDTOList = shopCategoryService.findByIdsAndActive(shopCategoryIds);
                tenantModel.setTenantShopCategoryList(shopCategoryWebConvert.toModels(shopCategoryDTOList));
            } else {
                tenantModel.setTenantShopCategoryList(Collections.emptyList());
            }
            return tenantModel;
        }).collect(Collectors.toList());
        TenantModelResponse tenantModelResponse = TenantModelResponse.builder().items(tenantModelList).total(tenantModelList.size()).build();
        return tenantModelResponse;
    }

}
