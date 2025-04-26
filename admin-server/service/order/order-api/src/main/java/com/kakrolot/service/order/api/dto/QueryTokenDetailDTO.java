package com.kakrolot.service.order.api.dto;

import lombok.Data;

/**
 * 查询激活码列表的条件DTO
 */
@Data
public class QueryTokenDetailDTO {
    private Long orderRecordId;
    private String token;
    private String tbShopName;
    private Long tbShopId;
    private String status;
    private String bindTimeStart;
    private String bindTimeEnd;
    private String createTimeStart;
    private String createTimeEnd;
    private String expireTimeStart;
    private String expireTimeEnd;
    private Long userId;
    private Integer startIndex;
    private Integer pageSize;
    private String sort;
} 