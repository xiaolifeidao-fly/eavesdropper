package com.kakrolot.service.order.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "order_amount_detail")
public class OrderAmountDetail extends BasePO {

    private Long orderId;

    private Long orderConsumerAmount;

    private String description;
}
