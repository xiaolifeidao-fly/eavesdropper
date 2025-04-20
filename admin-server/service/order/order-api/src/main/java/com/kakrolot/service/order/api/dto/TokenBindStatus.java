package com.kakrolot.service.order.api.dto;

/**
 * Token绑定淘宝店铺状态枚举
 */
public enum TokenBindStatus {
    
    UNBIND("未绑定"),
    BINDING("绑定中"),
    BOUND("已绑定"),
    BIND_FAILED("绑定失败"),
    AUTH_EXPIRED("授权过期"),
    UNBOUND("已解绑"),
    DISABLED("已禁用");
    
    private final String description;
    
    TokenBindStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * 根据枚举名称获取对应的描述信息
     * @param name 枚举名称（如 "BINDING", "UNBIND" 等）
     * @return 对应的描述信息，如果未找到则返回 null
     */
    public static String getDescriptionByName(String name) {
        try {
            return valueOf(name).getDescription();
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
} 