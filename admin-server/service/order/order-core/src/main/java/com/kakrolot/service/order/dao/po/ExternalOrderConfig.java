package com.kakrolot.service.order.dao.po;

import javax.persistence.Entity;
import javax.persistence.Table;

import com.kakrolot.common.po.BasePO;

import lombok.Data;

@Data
@Entity
@Table(name = "external_order_config")
public class ExternalOrderConfig extends BasePO {
    private String channel; // 外部渠道编码
    
    private String appId; // appId
    
    private String appSecret; // appSecret
    
    private String documentUrl; // 文档地址

    private String prefixUrl; // 请求前缀url
    
    private String statusUrl; // 订单状态操作URL
    
    private String progressUrl; // 更新订单完成进度URL
    
    private String cancelUrl; // 订单退单URL
    
    private String refundUrl; // 订单退款URL

    private String orderDetailUrl; // 订单详情URL

    private String orderListUrl; // 外部订单的订单列表
  
}
