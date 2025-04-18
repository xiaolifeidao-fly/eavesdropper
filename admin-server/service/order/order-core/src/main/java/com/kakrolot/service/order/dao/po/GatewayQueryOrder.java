package com.kakrolot.service.order.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import java.math.BigDecimal;

@Data
@Entity
public class GatewayQueryOrder extends BasePO {

    private Long tenantId;

    private Long shopId;

    private String shopName;

    private Long shopCategoryId;

    private String shopCategoryName;

    private Long initNum;

    private Long endNum;

    private String orderStatus;

    private Long orderNum;

    private Long orderAmount;

    private Long userId;

    private BigDecimal price;

    private String description;

    private String businessId;

    private String tenantName;

    private String userName;

    private String tinyUrl;

    private String orderHash;

    private String params;
}
