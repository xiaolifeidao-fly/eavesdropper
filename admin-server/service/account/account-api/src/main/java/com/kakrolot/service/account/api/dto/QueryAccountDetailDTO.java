package com.kakrolot.service.account.api.dto;

import com.kakrolot.common.dto.QueryDTO;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class QueryAccountDetailDTO extends QueryDTO {

    private Long accountId;

    private BigDecimal amount;

    private BigDecimal balanceAmount;

    private String operator;

    private String ip;

    private String type;

    private String description;

    private String businessId;

    private Date startTime;

    private Date endTime;
}
