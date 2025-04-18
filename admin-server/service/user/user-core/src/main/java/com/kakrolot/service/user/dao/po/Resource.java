package com.kakrolot.service.user.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "resource")
public class Resource extends BasePO {

    private String name;

    private String code;

    private Long parentId;

    private String resourceType;

    private String resourceUrl;

    private String pageUrl;

    private String component;

    private String redirect;

    private String menuName;

    private String meta;

    private Integer sortId;


}
