package com.kakrolot.service.shop.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "shop")
public class Shop extends BasePO {

    private String code;

    private String name;

    private Integer sortId;

    private Long shopGroupId;

    private String shopTypeCode;

    private Boolean approveFlag;

}
