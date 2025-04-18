package com.kakrolot.service.shop.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "shop_category")
public class ShopCategory extends BasePO {

    private BigDecimal price;

    private String secretKey;

    private Long lowerLimit;

    private Long upperLimit;

    private Long shopId;

    private String name;

    private String barryShopCategoryCode;

    private String status;

}
