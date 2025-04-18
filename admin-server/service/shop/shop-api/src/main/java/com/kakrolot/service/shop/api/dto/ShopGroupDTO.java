package com.kakrolot.service.shop.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class ShopGroupDTO extends BaseDTO {

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
