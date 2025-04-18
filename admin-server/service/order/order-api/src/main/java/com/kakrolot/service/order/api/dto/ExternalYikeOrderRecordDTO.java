package com.kakrolot.service.order.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class ExternalYikeOrderRecordDTO extends BaseDTO {
    private String channel; // 外部渠道编码
    
    private String externalOrderId; // 外部订单号
    
    private String goodsId; // 商品id
    
    private String goodsName; // 商品name
    
    private Long number; // 数量
    
    private String unitPrice; // 商品单价
}
