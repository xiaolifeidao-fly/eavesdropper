package com.kakrolot.service.business.response;

import com.kakrolot.service.order.api.dto.OrderTokenDetailDTO;

/**
 * 操作绑定结果
 */
public class BindResult {
    private boolean success;
    private String message;
    private OrderTokenDetailDTO orderTokenDetailDTO;
    
    /**
     * 私有构造函数，通过静态方法创建实例
     */
    private BindResult(boolean success, String message, OrderTokenDetailDTO orderTokenDetailDTO) {
        this.success = success;
        this.message = message;
        this.orderTokenDetailDTO = orderTokenDetailDTO;
    }
    
    /**
     * 创建成功结果
     * @return 成功结果实例
     */
    public static BindResult success(OrderTokenDetailDTO orderTokenDetailDTO) {
        return new BindResult(true, "操作成功", orderTokenDetailDTO);
    }
    
    /**
     * 创建成功结果并指定消息
     * @param message 成功消息
     * @return 成功结果实例
     */
    public static BindResult success(String message, OrderTokenDetailDTO orderTokenDetailDTO) {
        return new BindResult(true, message, orderTokenDetailDTO);
    }
    
    /**
     * 创建失败结果
     * @param message 失败原因
     * @return 失败结果实例
     */
    public static BindResult fail(String message) {
        return new BindResult(false, message, null);
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public String getMessage() {
        return message;
    }

    public OrderTokenDetailDTO getOrderTokenDetailDTO() {
        return orderTokenDetailDTO;
    }
} 