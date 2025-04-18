package com.kakrolot.web.convert.shop;

import com.kakrolot.service.shop.api.ShopService;
import com.kakrolot.service.shop.api.dto.QueryShopCategoryDTO;
import com.kakrolot.service.shop.api.dto.ShopCategoryDTO;
import com.kakrolot.service.shop.api.dto.ShopDTO;
import com.kakrolot.service.shop.api.dto.TenantShopStatus;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.PageModel;
import com.kakrolot.web.model.shop.ShopCategoryModel;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ShopCategoryWebConvert extends WebConvert<ShopCategoryDTO, ShopCategoryModel> {

    @Autowired
    private ShopService shopService;

    public QueryShopCategoryDTO toQueryDTO(ShopCategoryModel tenantShop, int startIndex, int pageSize) {
        QueryShopCategoryDTO queryShopCategoryDTO = new QueryShopCategoryDTO();
        BeanUtils.copyProperties(tenantShop, queryShopCategoryDTO);
        queryShopCategoryDTO.setStartIndex(startIndex);
        queryShopCategoryDTO.setPageSize(pageSize);
        return queryShopCategoryDTO;
    }

    public PageModel<ShopCategoryModel> toPageModel(Long count, List<ShopCategoryModel> shopCategoryModelList) {
        PageModel<ShopCategoryModel> pageModel = new PageModel<>();
        pageModel.setTotal(count);
        if (shopCategoryModelList == null) {
            shopCategoryModelList = Collections.emptyList();
        }
        pageModel.setItems(shopCategoryModelList);
        return pageModel;
    }


    public List<ShopCategoryModel> translateTenantShopDTOToTenantShopModelResponse(List<ShopCategoryDTO> shopCategoryDTOS) {
        List<ShopCategoryModel> shopCategoryModelList = shopCategoryDTOS.stream().map(tenantShopDTO -> {
            ShopCategoryModel shopCategoryModel = this.toModel(tenantShopDTO);
            ShopDTO shopDTO = shopService.findById(shopCategoryModel.getShopId());
            shopCategoryModel.setShopName(shopDTO.getName());
            return shopCategoryModel;
        }).collect(Collectors.toList());
        List<ShopCategoryModel> activeList = shopCategoryModelList.stream()
                .filter(shopCategoryModel -> TenantShopStatus.ACTIVE.name().equals(shopCategoryModel.getStatus())).collect(Collectors.toList());
        List<ShopCategoryModel> lrList = activeList.stream()
                .filter(shopCategoryModel -> shopCategoryModel.getName().contains("lr") || shopCategoryModel.getName().contains("LR")).collect(Collectors.toList());
        List<ShopCategoryModel> expireList = shopCategoryModelList.stream()
                .filter(shopCategoryModel -> TenantShopStatus.EXPIRE.name().equals(shopCategoryModel.getStatus())).collect(Collectors.toList());
        activeList.removeAll(lrList);
        activeList.addAll(lrList);
        activeList.addAll(expireList);
        return activeList;
    }

}
