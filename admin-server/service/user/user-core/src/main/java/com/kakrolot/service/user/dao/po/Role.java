package com.kakrolot.service.user.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Table(name = "role")
@Entity
public class Role extends BasePO {

    private String name;

    private String code;

}
