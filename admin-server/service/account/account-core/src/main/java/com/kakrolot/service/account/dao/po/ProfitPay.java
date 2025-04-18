package com.kakrolot.service.account.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Table(name = "profit_pay")
@Entity
public class ProfitPay extends BasePO {

    private Date date;

    private BigDecimal outAmount;

    private BigDecimal inAmount;

    private BigDecimal profitAmount;

    private String status;

}
