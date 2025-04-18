package com.kakrolot.service.order.api.dto.yike;

import lombok.Data;

@Data
public class YikeOrderDetailResponse {
    private Integer code;
    private String msg;
    private OrderDetailResult result;
    
    @Data
    public static class OrderDetailResult {
        private String orderSN;
        private String customOrderSN;
        private Integer state;//订单状态:-1:待付款,1:已付款,2:处理中,3:异常,4.已完成,5:退单中,6:已退单,7:已退
        private Integer buyUserId;
        private String goodsSN;
        private String goodsName;
        private String number;
        private String orderRemark;
        private Integer startNum;
        private Integer currentNum;
        private Integer finishTotal;
        private String price;
        private String amount;
        private String refundAmount;
        private Integer refundNumber;
        private String params;
        private String orderNote;
        private String logs;
        private Long createdAt;
    }
} 