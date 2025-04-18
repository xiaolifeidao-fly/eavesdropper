package com.kakrolot.service.order.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import java.math.BigDecimal;

@Data
@Entity
public class QueryOrder extends BasePO {

    private Long tenantId;

    private String tenantName;

    private Long shopId;

    private String shopName;

    private Long shopCategoryId;

    private String shopCategoryName;

    private Long initNum;

    private Long endNum;

    private String orderStatus;

    private String refundStatus;

    private Long orderNum;

    private Long orderAmount;

    private Long userId;

    private String description;

    private BigDecimal price;

    private String businessId;

    private String tinyUrl;

    private String orderHash;

}
