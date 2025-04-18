package com.kakrolot.web.model.account;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountModel extends BaseModel {


    private Long userId;

    private String accountStatus;

    private BigDecimal balanceAmount;

    private BigDecimal amount;

    /**
     * 赠送金额百分比
     */
    private int givenScale;

}
