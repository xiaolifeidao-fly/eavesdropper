package com.kakrolot.web.model.shop;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ShopCategoryModel extends BaseModel {

    //价格
    private BigDecimal price;

    //密钥
    private String secretKey;

    //下限
    private Long lowerLimit;

    //上限
    private Long upperLimit;

    private Long shopId;

    //商品名称
    private String shopName;

    private String code;

    //类目名称名称
    private String name;

    //状态
    private String status;

    private String barryShopCategoryCode;

}
