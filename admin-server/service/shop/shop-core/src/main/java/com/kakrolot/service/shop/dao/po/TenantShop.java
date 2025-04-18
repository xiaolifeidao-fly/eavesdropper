package com.kakrolot.service.shop.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "tenant_shop")
public class TenantShop extends BasePO {

    private Long shopId;

    private Long tenantId;

}
