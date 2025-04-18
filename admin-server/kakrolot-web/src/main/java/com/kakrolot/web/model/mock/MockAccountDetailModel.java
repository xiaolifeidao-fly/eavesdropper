package com.kakrolot.web.model.mock;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

import java.math.BigDecimal;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockAccountDetailModel extends BaseModel {

    //操作人
    private String operator;

    //金额
    private BigDecimal amount;

    //账户余额
    private BigDecimal balanceAmount;

}
