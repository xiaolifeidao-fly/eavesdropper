package com.kakrolot.service.approve.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "assignment")
public class QueryAssignmentCondition extends BasePO {

    private String url;

    private Long totalNum;

    private Long factNum;

    private Long userId;

    private Long orderId;

    private String approveStatus;

    private String orderStatus;

}
