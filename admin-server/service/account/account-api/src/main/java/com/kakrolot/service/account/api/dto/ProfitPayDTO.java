package com.kakrolot.service.account.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class ProfitPayDTO extends BaseDTO {

    private Date date;

    private BigDecimal outAmount;

    private BigDecimal inAmount;

    private BigDecimal profitAmount;

    private String status;

}
