package com.kakrolot.web.model.account;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRechargeModel extends BaseModel {

    //流水号
    private String businessId;

    //用户名
    private String username;

    //备注
    private String remark;

    //充值金额
    private BigDecimal amount;

    //描述
    private String description;

    //操作人
    private String operator;

    //操作时间
    private String operatorTime;

}
