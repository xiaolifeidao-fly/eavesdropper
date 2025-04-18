package com.kakrolot.service.order.api.dto.yike;

import lombok.Data;

@Data
public class ExternalYikeOrderRequestModel {

    private Long createdAt; // 创建时间

    private String goodsName; // 商品名称

    private Integer goodsSN; // 商品编号

    private String goodsThumb; // 商品缩略图

    private Integer number; // 商品数量

    private String orderSN; // 订单编号

    private String unitPrice; // 商品单价

    private String params; //"[{\"alias\":\"视频链接\",\"name\":\"视频链接\",\"value\":\"https://www.douyin.com/video/7453475040403705147\"}]"


}
