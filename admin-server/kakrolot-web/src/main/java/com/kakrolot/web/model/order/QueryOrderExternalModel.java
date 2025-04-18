package com.kakrolot.web.model.order;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class QueryOrderExternalModel extends BaseModel {

    private Long tenantId;

    private Long shopId;

    private String shopName;

    private Long shopCategoryId;

    private String shopCategoryName;

    private Long userId;

    private String userName;

    private Long initNum;

    private Long endNum;

    private String orderStatus;

    private String orderStatusShow;

    // 数量
    private Long orderNum;

    private String businessId;

    private String startTime;

    private String endTime;

    private String tinyUrl;

    private String orderCreateTime;

    private String orderUpdateTime;

}
