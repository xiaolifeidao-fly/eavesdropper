package com.kakrolot.service.account.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "account_detail")
public class AccountDetail extends BasePO {

    private Long accountId;

    private Long amount;

    private Long balanceAmount;

    private String operator;

    private String ip;

    private String type;

    private String description;

    private String businessId;

}
