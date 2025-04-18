package com.kakrolot.service.order.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderBkRecordDTO extends BaseDTO {

    private Long tenantId;

    private Long orderId;

    private BigDecimal amount;

    private Long num;

    private Long shopCategoryId;

    private Long shopId;
}
