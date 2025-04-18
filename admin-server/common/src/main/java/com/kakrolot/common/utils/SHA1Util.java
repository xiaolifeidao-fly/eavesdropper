package com.kakrolot.common.utils;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class SHA1Util {

    /**
     * 生成SHA1摘要
     * @param input 输入字符串
     * @return SHA1摘要
     */
    public static String generateSHA1(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] bytes = digest.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-1 algorithm not found", e);
        }
    }

    /**
     * 生成AppToken
     * @param appId 应用ID
     * @param appSecret 应用密钥
     * @param requestURI 请求URI
     * @param appTimestamp 时间戳
     * @return 生成的AppToken
     */
    public static String generateAppToken(String appId, String appSecret, String requestURI, String appTimestamp) {
        String input = appId + appSecret + requestURI + appTimestamp;
        return generateSHA1(input);
    }

    public static void main(String[] args) {
        // 示例数据
        String appId = "TWNYdg0Jao7jtKHIjKrGB8v6bSUKAG_s";
        String appSecret = "dny18k43iD70k5L__CLFmhBBGHC3VtshVO9PKfZP8T37G5nS2t";
//        String requestURI = "/api/supplier/order/v2/order?orderSN=1115898";
        String requestURI = "/api/supplier/order/v2/orders?/api/supplier/order/v2/orders?page=1&goodsSN=288&state=5&limit=100";
        String appTimestamp = "1596685499";

        // 使用新方法生成AppToken
        String appToken = generateAppToken(appId, appSecret, requestURI, appTimestamp);
        System.out.println("AppToken: " + appToken);

        // 供应商推送接口的token生成
        String url = "http://www.xx.com/aa/bb";
        String supplierAppToken = generateAppToken(appId, appSecret, url, appTimestamp);
        System.out.println("Supplier AppToken: " + supplierAppToken);
    }
}
