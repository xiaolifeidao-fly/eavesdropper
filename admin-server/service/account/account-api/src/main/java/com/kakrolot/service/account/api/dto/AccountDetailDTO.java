package com.kakrolot.service.account.api.dto;

import java.math.BigDecimal;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class AccountDetailDTO extends BaseDTO {

    private Long accountId;

    private BigDecimal amount;

    private BigDecimal balanceAmount;

    private String operator;

    private String ip;

    private String type;

    private String description;

    private String businessId;
}
