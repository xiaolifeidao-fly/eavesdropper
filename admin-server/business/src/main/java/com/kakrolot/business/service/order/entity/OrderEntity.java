package com.kakrolot.business.service.order.entity;

import com.kakrolot.service.order.api.dto.OrderRecordExtParamDTO;
import lombok.Data;

import java.math.BigDecimal;
@Data
public class OrderEntity {

    private Long initNum;

    private Long tenantId;

    private Long shopId;

    private Long shopCategoryId;

    private Long endNum;

    private String orderStatus;

    private Long orderNum;

    private Long userId;

    private String operator;

    private String businessId;

    private String ip;

    private Long id;

    private BigDecimal price;

    private String userName;

    private OrderRecordExtParamDTO orderRecordExtParamDTO;

    private String channel; // 外部渠道编码

    private Long externalOrderRecordId; // 外部渠道订单id（本系统外键id）
    
    private String externalOrderId; // 外部真实订单号

    private String externalOrderPrice; // 外部订单的单价
    
    private String externalOrderAmount; // 外部订单的金额

}
