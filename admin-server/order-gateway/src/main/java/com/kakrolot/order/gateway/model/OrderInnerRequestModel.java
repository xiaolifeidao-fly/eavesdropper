package com.kakrolot.order.gateway.model;

import lombok.Data;

@Data
public class OrderInnerRequestModel {

    private String orderNo;

    private Long startNum;

    private Long endNum;

    private String status;

    private String businessKey;

    private String key;

}
