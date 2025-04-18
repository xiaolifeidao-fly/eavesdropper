package com.kakrolot.web.convert.shop;

import com.kakrolot.service.shop.api.dto.ShopDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.shop.ShopModel;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ShopWebConvert extends WebConvert<ShopDTO, ShopModel> {

    public List<ShopModel> toShopModels(List<ShopDTO> shopDTOList) {
        if (shopDTOList == null) {
            return Collections.emptyList();
        }
        return shopDTOList.stream().map(this::toModel).sorted(Comparator.comparing(ShopModel::getSortId))
                .collect(Collectors.toList());
    }

}
