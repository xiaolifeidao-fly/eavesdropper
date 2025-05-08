package com.kakrolot.web.model.order;

import lombok.Data;

/**
 * 查询激活码列表的条件Model
 */
@Data
public class QueryTokenDetailModel {
    private Long orderRecordId;
    private String token;
    private String tbShopName;
    private String tbShopId;
    private String status;
    private String bindTimeStart;
    private String bindTimeEnd;
    private String createTimeStart;
    private String createTimeEnd;
    private String expireTimeStart;
    private String expireTimeEnd;
    private Long userId;
} 