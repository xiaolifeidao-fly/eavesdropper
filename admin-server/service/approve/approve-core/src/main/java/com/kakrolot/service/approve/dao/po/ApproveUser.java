package com.kakrolot.service.approve.dao.po;

import com.kakrolot.common.dto.BaseDTO;
import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "approve_user")
public class ApproveUser extends BasePO {

    private Long userId;

    private Long unApproveNum;

    private String status;
}
