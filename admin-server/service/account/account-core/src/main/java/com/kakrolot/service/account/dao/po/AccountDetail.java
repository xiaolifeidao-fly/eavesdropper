package com.kakrolot.service.account.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "account_detail")
public class AccountDetail extends BasePO {

    private Long accountId;

    private BigDecimal amount;

    private BigDecimal balanceAmount;

    private String operator;

    private String ip;

    private String type;

    private String description;

    private String businessId;

}
