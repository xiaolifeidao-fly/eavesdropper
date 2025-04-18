package com.kakrolot.service.order.api.dto.yike;

import lombok.Data;
import java.util.List;

@Data
public class YikeOrderListResponse {
    private Integer code; // 响应状态码
    private String msg; // 响应消息
    private Result result; // 结果对象

    @Data
    public static class Result {
        private List<OrderDetailResult> data; // 订单详情列表
        private Integer total; // 总数
    }

    @Data
    public static class OrderDetailResult {
        private String orderSN; // 订单编号
        private String customOrderSN; // 自定义订单编号
        private Integer state; // 订单状态
        private Integer buyUserId; // 购买用户ID
        private String goodsSN; // 商品编号
        private String goodsName; // 商品名称
        private String number; // 商品数量
        private String orderRemark; // 订单备注
        private Integer startNum; // 开始数量
        private Integer currentNum; // 当前数量
        private Integer finishTotal; // 完成总数
        private String price; // 价格
        private String amount; // 金额
        private String refundAmount; // 退款金额
        private Integer refundNumber; // 退款数量
        private String params; // 参数
        private String orderNote; // 订单备注
        private String logs; // 日志
        private Long createdAt; // 创建时间
        private String cardNumber; // 卡号
    }
}
