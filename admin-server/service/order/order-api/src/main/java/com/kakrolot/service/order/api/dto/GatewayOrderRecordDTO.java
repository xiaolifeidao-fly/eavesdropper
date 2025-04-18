package com.kakrolot.service.order.api.dto;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class GatewayOrderRecordDTO extends BaseDTO {

    private Long tenantId;

    private Long shopId;

    private Long shopCategoryId;

    private String shopCategoryName;

    private Long initNum;

    private Long endNum;

    private String orderStatus;

    private Long orderNum;

    private BigDecimal orderAmount;

    private Long userId;

    private String description;

    private BigDecimal price;

    private String businessId;

    private String tenantName;

    private String shopName;

    private String userName;

    private String tinyUrl;

    private String orderHash;

    private JSONObject params;

}
