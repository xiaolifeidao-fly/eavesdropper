package com.kakrolot.service.account.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "account")
public class Account extends BasePO {

    private Long userId;

    private String accountStatus;

    private BigDecimal balanceAmount;
}
