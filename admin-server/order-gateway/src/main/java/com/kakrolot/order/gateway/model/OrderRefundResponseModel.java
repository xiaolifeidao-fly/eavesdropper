package com.kakrolot.order.gateway.model;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderRefundResponseModel {

    private String orderNo;

    private String status;

    private BigDecimal refundAmt;

    private String orderRefundNo;

}
