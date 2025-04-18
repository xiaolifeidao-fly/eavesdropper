package com.kakrolot.service.approve.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "shop_approve_user")
public class ShopApproveUser extends BasePO {

    private String approveType;

    private Long userId;

    private Long shopId;
}
