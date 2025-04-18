package com.kakrolot.service.order.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderAmountDetailDTO extends BaseDTO {

    private Long orderId;

    private BigDecimal orderConsumerAmount;

    private String description;
}
