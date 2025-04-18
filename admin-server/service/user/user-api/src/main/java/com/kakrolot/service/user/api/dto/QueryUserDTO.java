package com.kakrolot.service.user.api.dto;

import com.kakrolot.common.dto.QueryDTO;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class QueryUserDTO extends QueryDTO {

    private String username;

    private String originPassword;

    private String secretKey;

    private String accountStatus;

    private BigDecimal balanceAmount;

    private Long accountId;

    private String remark;
}
