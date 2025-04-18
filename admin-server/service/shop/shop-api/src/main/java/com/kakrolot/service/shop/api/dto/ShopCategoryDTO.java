package com.kakrolot.service.shop.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ShopCategoryDTO extends BaseDTO {

    private BigDecimal price;

    private String secretKey;

    private Long lowerLimit;

    private Long upperLimit;

    private Long shopId;

    private String name;

    private String barryShopCategoryCode;

    private String status;
}
