package com.kakrolot.service.shop.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "tenant_shop_category")
public class TenantShopCategory extends BasePO {

    private Long tenantId;

    private Long shopCategoryId;

}
