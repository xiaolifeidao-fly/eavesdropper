package com.kakrolot.service.order.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderRefundRecordDTO extends BaseDTO {

    private Long tenantId;

    private Long orderId;

    private BigDecimal refundAmount;

    private Long refundNum;

    private Long shopCategoryId;

    private String orderRefundStatus;
}
