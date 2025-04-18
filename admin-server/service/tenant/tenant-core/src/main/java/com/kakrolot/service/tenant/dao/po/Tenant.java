package com.kakrolot.service.tenant.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Table(name = "tenant")
@Entity
public class Tenant extends BasePO {

    private String code;

    private String name;
}
