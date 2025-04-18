package com.kakrolot.web.model.account;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountDetailModel extends BaseModel {

    private Long accountId;

    //金额
    private BigDecimal amount;

    //账户余额
    private BigDecimal balanceAmount;

    //操作人
    private String operator;

    private String ip;

    //类型
    private String type;

    //描述
    private String description;

    //账户流水号
    private String businessId;

    //开始时间
    private String startTime;

    //结束时间
    private String endTime;

    //更新时间
    private String updateTimeStr;

    //账户明细对应的短链接
    private String tinyUrl;

}
