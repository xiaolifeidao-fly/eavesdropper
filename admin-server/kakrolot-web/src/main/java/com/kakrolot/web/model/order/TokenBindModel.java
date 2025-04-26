package com.kakrolot.web.model.order;

import lombok.Data;

/**
 * 激活码绑定参数模型
 */
@Data
public class TokenBindModel {
    /**
     * 激活码
     */
    private String token;
    
    /**
     * 淘宝店铺名称
     */
    private String tbShopName;
    
    /**
     * 淘宝店铺ID
     */
    private String tbShopId;
} 