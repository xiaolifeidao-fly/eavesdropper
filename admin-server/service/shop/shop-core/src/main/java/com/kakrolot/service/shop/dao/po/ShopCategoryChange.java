package com.kakrolot.service.shop.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.math.BigDecimal;

/**
 * Created by roc_peng on 2020/9/16.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Data
@Entity
@Table(name = "shop_category_change")
public class ShopCategoryChange extends BasePO {

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
