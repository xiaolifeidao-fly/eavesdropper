package com.kakrolot.web.convert.shop;

import com.kakrolot.service.shop.api.dto.ShopExtParamDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.shop.ShopExtParamModel;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ShopExtParamWebConvert extends WebConvert<ShopExtParamDTO, ShopExtParamModel> {

    public List<ShopExtParamModel> toShopExtParamModels(List<ShopExtParamDTO> shopExtParamDTOList) {
        if (CollectionUtils.isEmpty(shopExtParamDTOList)) {
            return Collections.emptyList();
        }
        return shopExtParamDTOList.stream().map(this::toShopExtParamModel)
                .collect(Collectors.toList());
    }

    public ShopExtParamModel toShopExtParamModel(ShopExtParamDTO shopExtParamDTO) {
        ShopExtParamModel shopExtParamModel = new ShopExtParamModel();
        BeanUtils.copyProperties(shopExtParamDTO, shopExtParamModel);
        shopExtParamModel.setShopExtParamId(shopExtParamDTO.getId());
        //TODO 候选值
        shopExtParamModel.setCandidateValuesList(Collections.emptyList());
        return shopExtParamModel;
    }

}
