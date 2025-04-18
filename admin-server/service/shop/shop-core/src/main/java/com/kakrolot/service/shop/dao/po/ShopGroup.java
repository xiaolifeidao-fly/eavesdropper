package com.kakrolot.service.shop.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "shop_group")
public class ShopGroup extends BasePO {

    private String code;

    private String name;

    private String businessType;

    private String businessCode;

    private Integer settleDay;

    private Boolean settleFlag;

    private String price;

    private Boolean calRgFlag;

    private String chargeType;

    private String groupName;

    private Boolean dashboardActive;

    private String dashboardTitle;

    private Integer dashboardSortId;

}
