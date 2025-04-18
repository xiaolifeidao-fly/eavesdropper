package com.kakrolot.service.tenant.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Table(name = "tenant_user")
@Entity
public class TenantUser extends BasePO {

    private Long userId;

    private Long tenantId;
}
