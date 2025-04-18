package com.kakrolot.service.order.api.dto;

import com.kakrolot.common.dto.QueryDTO;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class QueryOrderDTO extends QueryDTO {

    private Long tenantId;

    private String tenantName;

    private Long shopId;

    private String shopName;

    private Long shopCategoryId;

    private String shopCategoryName;

    private Long initNum;

    private Long endNum;

    private String orderStatus;

    private String refundStatus;

    private Long orderNum;

    private BigDecimal orderAmount;

    private Long userId;

    private Long orderRecordId;

    private String description;

    private String operator;

    private BigDecimal price;

    private String businessId;

    private String userName;

    private Date startTime;

    private Date endTime;

    private String tinyUrl;

    private String orderHash;

}
