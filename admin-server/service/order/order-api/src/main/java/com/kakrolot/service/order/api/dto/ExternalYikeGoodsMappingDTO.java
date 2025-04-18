package com.kakrolot.service.order.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class ExternalYikeGoodsMappingDTO extends BaseDTO {
    private String goodsId; // 商品id
    
    private Long shopCategoryId; // 商品类目id
}
