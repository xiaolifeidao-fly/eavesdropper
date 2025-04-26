package com.kakrolot.service.business.response;

/**
 * 操作绑定结果
 */
public class BindResult {
    private boolean success;
    private String message;
    
    /**
     * 私有构造函数，通过静态方法创建实例
     */
    private BindResult(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    /**
     * 创建成功结果
     * @return 成功结果实例
     */
    public static BindResult success() {
        return new BindResult(true, "操作成功");
    }
    
    /**
     * 创建成功结果并指定消息
     * @param message 成功消息
     * @return 成功结果实例
     */
    public static BindResult success(String message) {
        return new BindResult(true, message);
    }
    
    /**
     * 创建失败结果
     * @param message 失败原因
     * @return 失败结果实例
     */
    public static BindResult fail(String message) {
        return new BindResult(false, message);
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public String getMessage() {
        return message;
    }
} 