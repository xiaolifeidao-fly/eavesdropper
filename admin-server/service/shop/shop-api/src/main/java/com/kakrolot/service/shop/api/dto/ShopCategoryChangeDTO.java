package com.kakrolot.service.shop.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Created by roc_peng on 2020/9/16.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Data
public class ShopCategoryChangeDTO extends BaseDTO {

    private Long userId;

    private Long shopId;

    private Long shopCategoryId;

    private String shopCategoryName;

    private BigDecimal oldPrice;

    private BigDecimal newPrice;

    private Long oldLowerLimit;

    private Long newLowerLimit;

    private Long oldUpperLimit;

    private Long newUpperLimit;

}
