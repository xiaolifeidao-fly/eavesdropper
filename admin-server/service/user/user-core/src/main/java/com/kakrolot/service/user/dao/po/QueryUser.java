package com.kakrolot.service.user.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;

@Data
@Entity
public class QueryUser extends BasePO {

    private String username;

    private String originPassword;

    private String secretKey;

    private String accountStatus;

    private Long balanceAmount;

    private Long accountId;

    private String remark;
}
