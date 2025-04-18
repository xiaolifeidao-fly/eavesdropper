package com.kakrolot.service.order.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "order_refund_record")
public class OrderRefundRecord extends BasePO {

    private Long tenantId;

    private Long orderId;

    private BigDecimal refundAmount;

    private Long shopCategoryId;

    private Long refundNum;

    private String orderRefundStatus;

}
