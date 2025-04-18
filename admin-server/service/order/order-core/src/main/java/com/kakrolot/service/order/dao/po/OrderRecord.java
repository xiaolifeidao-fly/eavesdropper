package com.kakrolot.service.order.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "order_record")
public class OrderRecord extends BasePO {

    private Long tenantId;

    private Long shopId;

    private String shopName;

    private Long shopCategoryId;

    private String shopCategoryName;

    private Long initNum;

    private Long endNum;

    private String orderStatus;

    private Long orderNum;

    private BigDecimal orderAmount;

    private Long userId;

    private BigDecimal price;

    private String description;

    private String businessId;

    private String tenantName;

    private String userName;

    private String tinyUrl;

    private String orderHash;

    private String channel; // 外部渠道编码

    private Long externalOrderRecordId; // 外部渠道订单id（本系统外键id）
    
    private String externalOrderId; // 外部真实订单号

    private String externalOrderPrice; // 外部订单的单价
    
    private String externalOrderAmount; // 外部订单的金额

}
