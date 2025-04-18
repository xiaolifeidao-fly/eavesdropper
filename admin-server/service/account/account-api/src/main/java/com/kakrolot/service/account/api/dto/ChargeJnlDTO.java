package com.kakrolot.service.account.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ChargeJnlDTO extends BaseDTO {

    private Long profitPayId;

    private String type;

    private String remark;

    private BigDecimal price;

    private Long num;

    private String status;
}
