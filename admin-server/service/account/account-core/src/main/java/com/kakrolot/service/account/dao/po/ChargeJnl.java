package com.kakrolot.service.account.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.math.BigDecimal;

@Data
@Table(name = "charge_jnl")
@Entity
public class ChargeJnl extends BasePO {

    private Long profitPayId;

    private String type;

    private String remark;

    private BigDecimal price;

    private Long num;

    private String status;

}
