package com.kakrolot.service.order.dao.po;

import javax.persistence.Entity;
import javax.persistence.Table;

import com.kakrolot.common.po.BasePO;

import lombok.Data;

@Data
@Entity
@Table(name = "external_yike_order_record")
public class ExternalYikeOrderRecord extends BasePO {
    private String channel; // 外部渠道编码
    
    private String externalOrderId; // 外部订单号
    
    private String goodsId; // 商品id
    
    private String goodsName; // 商品name
    
    private Long number; // 数量
    
    private String unitPrice; // 商品单价
 
}
