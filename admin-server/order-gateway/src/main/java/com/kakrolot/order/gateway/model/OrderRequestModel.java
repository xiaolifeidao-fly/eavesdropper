package com.kakrolot.order.gateway.model;

import com.alibaba.fastjson.JSONObject;
import lombok.Data;
import lombok.NonNull;

@Data
public class OrderRequestModel {

    private String orderNo;

    private Long startNum;

    private Long endNum;

    private Long totalNum;

    private String status;

    private String businessKey;

    private String encryptionKey;

    private String shopKey;

    private String userName;

    private JSONObject params;

}
