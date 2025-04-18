package com.kakrolot.order.gateway.model;

import com.alibaba.fastjson.JSONObject;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderResponseModel {

    private String orderNo;

    private String businessKey;

    private Long totalNum;

    private Long startNum;

    private Long endNum;

    private BigDecimal orderAmt;

    private BigDecimal refundAmt;

    private String status;

    private String statusDesc;

    private JSONObject params;

}
