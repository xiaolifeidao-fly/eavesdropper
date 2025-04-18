package com.kakrolot.service.order.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "order_bk_record")
public class OrderBkRecord extends BasePO {

    private Long tenantId;

    private Long orderId;

    private Long amount;

    private Long num;

    private Long shopCategoryId;

    private Long shopId;
}
