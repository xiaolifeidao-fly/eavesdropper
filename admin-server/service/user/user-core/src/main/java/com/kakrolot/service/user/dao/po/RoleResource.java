package com.kakrolot.service.user.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Table(name = "role_resource")
@Entity
public class RoleResource extends BasePO {

    private Long roleId;

    private Long resourceId;

}
