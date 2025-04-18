package com.kakrolot.service.account.api.dto;

import java.math.BigDecimal;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class AccountDTO extends BaseDTO {

    private Long userId;

    private String accountStatus;

    private BigDecimal balanceAmount;

}
