package com.kakrolot.order.consumer.handler.impl;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.business.service.ResponseUtils;
import com.kakrolot.business.service.order.OrderConsumerConfig;
import com.kakrolot.business.service.order.OrderService;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.business.service.response.Response;
import com.kakrolot.common.dto.ExternalChannel;
import com.kakrolot.common.utils.AmountUtils;
import com.kakrolot.common.utils.SHA1Util;
import com.kakrolot.order.consumer.handler.OrderAndAccountHandler;
import com.kakrolot.order.consumer.handler.asign.AssignHandler;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.account.api.dto.AmountType;
import com.kakrolot.service.order.api.ExternalOrderConfigService;
import com.kakrolot.service.order.api.OrderRecordService;
import com.kakrolot.service.order.api.RefundOrderService;
import com.kakrolot.service.order.api.dto.ExternalOrderConfigDTO;
import com.kakrolot.service.order.api.dto.OrderAmountDetailDTO;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.order.api.dto.OrderRefundRecordDTO;
import com.kakrolot.service.order.api.dto.OrderStatus;
import com.kakrolot.service.shop.api.ShopCategoryService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * 退单
 */
@Component
@Slf4j
public class RefundOrderHandler extends OrderAndAccountHandler<OrderRefundRecordDTO> {

    @Autowired
    private RefundOrderService refundOrderService;

    @Autowired
    private AssignHandler assignHandler;

    @Autowired
    private ShopCategoryService shopCategoryService;
    
    @Autowired
    private ExternalOrderConfigService externalOrderConfigService;

    @Autowired
    private OrderRecordService orderRecordService;

    @Override
    protected OrderRefundRecordDTO toRecord(OrderEntity orderEntity) {
        return refundOrderService.findById(orderEntity.getId());
    }

    @Override
    protected Response validate(AccountDTO accountDTO, OrderEntity orderEntity, OrderRefundRecordDTO orderRefundRecordDTO) {
        if (!OrderStatus.REFUND_HANDING.name().equals(orderRefundRecordDTO.getOrderRefundStatus())) {
            log.warn("finish order num error by {} ", orderRefundRecordDTO);
            return ResponseUtils.buildSuccess("订单不允许退单");
        }
        return ResponseUtils.buildSuccess("退单");
    }

    @Override
    protected void handlerValidateError(Response response, OrderEntity orderEntity, OrderRefundRecordDTO orderRefundRecordDTO) {
        //nothing
        log.warn("refund error by {} the reason is {}", orderEntity, response.getMessage());
    }

    @Override
    protected boolean handlerAccount(AccountDTO accountDTO, OrderEntity orderEntity, OrderRefundRecordDTO orderRefundRecordDTO) {
        Long cha = orderEntity.getEndNum() - orderEntity.getInitNum();
        if (cha < 0) {
            cha = 0L;
        }
        Long refundNum = orderEntity.getOrderNum() - cha;
        if (refundNum < 0) {
            refundNum = 0L;
        }
        BigDecimal refundAmount = new BigDecimal(refundNum).multiply(orderEntity.getPrice());
        String businessId = "REFUND" + "_" + orderRefundRecordDTO.getId();
        userAccountService.handlerAmount(accountDTO, refundAmount, orderEntity.getIp(), orderEntity.getOperator(), AmountType.REFUND, businessId,orderRefundRecordDTO.getOrderId());
        return true;
    }

    @Override
    protected OrderConsumerConfig getOrderConsumerConfig() {
        return OrderConsumerConfig.UPDATE;
    }

    @Override
    protected void handlerOrder(OrderEntity orderEntity, OrderRefundRecordDTO orderRefundRecordDTO) {
        Long endNum = orderEntity.getEndNum();
        if (endNum < 0) {
            endNum = 0L;
        }
        Long cha = endNum - orderEntity.getInitNum();
        if (cha < 0) {
            cha = 0L;
        }
        long refundNum = orderEntity.getOrderNum() - cha;
        if (refundNum < 0) {
            refundNum = 0L;
        }
        BigDecimal refundAmount = new BigDecimal(refundNum).multiply(orderEntity.getPrice());
        saveRefund(orderRefundRecordDTO, refundNum, refundAmount);
        saveAmountDetail(orderEntity, refundAmount, orderRefundRecordDTO);
        refundOrder(orderRefundRecordDTO, orderEntity.getInitNum(), endNum);
        
        // External 退单通知外部系统
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderRefundRecordDTO.getOrderId());
        notifyExternalSystem(orderRecordDTO, refundNum, orderEntity);
    }

    @Override
    protected void afterHandler(OrderRefundRecordDTO order, OrderEntity orderEntity) {
        Long endNum = orderEntity.getEndNum();
        if (endNum < 0) {
            endNum = 0L;
        }
        long cha = endNum - orderEntity.getInitNum();
        if (cha < 0) {
            cha = 0L;
        }
        assign(order, cha);
    }

    private void assign(OrderRefundRecordDTO orderRefundRecordDTO, Long cha) {
        Long orderId = orderRefundRecordDTO.getOrderId();
        Long shopCategoryId = orderRefundRecordDTO.getShopCategoryId();
        Long shopId = shopCategoryService.findById(shopCategoryId).getShopId();
        assignHandler.assign(orderId, shopId, cha);
    }

    private void refundOrder(OrderRefundRecordDTO orderRefundRecordDTO, Long initNum, Long endNum) {
        if (endNum < 0) {
            endNum = 0L;
        }
        orderRecordService.updateOrderStatusAndInitNumAndEndNumById(OrderStatus.REFUND_SUCCESS.name(), initNum, endNum, orderRefundRecordDTO.getOrderId());
    }

    private void saveAmountDetail(OrderEntity orderEntity, BigDecimal refundAmount, OrderRefundRecordDTO orderRefundRecordDTO) {
        OrderAmountDetailDTO orderAmountDetailDTO = new OrderAmountDetailDTO();
        orderAmountDetailDTO.setDescription("退单金额:" + refundAmount + "元");
        orderAmountDetailDTO.setOrderId(orderRefundRecordDTO.getOrderId());
        orderAmountDetailDTO.setOrderConsumerAmount(refundAmount.negate());
        orderAmountDetailDTO.setUpdateBy(orderEntity.getOperator());
        orderAmountDetailDTO.setCreateBy(orderEntity.getOperator());
        orderAmountDetailService.save(orderAmountDetailDTO);
    }

    private void saveRefund(OrderRefundRecordDTO refundRecordDTO, long refundNum, BigDecimal refundAmount) {
        fillRefundOrderDTO(refundRecordDTO, refundNum, refundAmount);
        refundOrderService.save(refundRecordDTO);
    }

    private void fillRefundOrderDTO(OrderRefundRecordDTO refundRecordDTO, Long refundNum, BigDecimal refundAmount) {
        refundRecordDTO.setRefundAmount(refundAmount);
        refundRecordDTO.setRefundNum(refundNum);
        refundRecordDTO.setOrderRefundStatus(OrderStatus.REFUND_SUCCESS.name());
    }

    /**
     * 通知外部系统订单状态
     * 根据不同的channel调用不同的通知方法
     */
    public void notifyExternalSystem(OrderRecordDTO orderRecordDTO, long refundNum, OrderEntity orderEntity) {
        String channel = orderRecordDTO.getChannel();
        if (StringUtils.isBlank(channel)) {
            log.debug("Order is not from external system, skip notification");
            return;
        }
        
        switch (channel) {
            case ExternalChannel.YIKE_CHANNEL:
                notifyYikeRefund(orderRecordDTO, refundNum);
                notifyYikeProgress(orderRecordDTO, orderEntity);
                break;
            default:
                log.warn("Unsupported external channel: {}", channel);
                break;
        }
    }
    
    /**
     * 通知亿刻外部系统退单和退款
     */
    private void notifyYikeRefund(OrderRecordDTO orderRecordDTO, long refundNum) {
        ExternalOrderConfigDTO configDTO = externalOrderConfigService.getByChannel(ExternalChannel.YIKE_CHANNEL);
        if (configDTO == null) {
            log.error("External order config not found for channel: {}", ExternalChannel.YIKE_CHANNEL);
            return;
        }

        // 1. 通知订单退单（理论上 本系统未获取到当前值时  完整退单）
//        notifyYikeOrderCancel(configDTO, orderRecordDTO.getExternalOrderId());
        
        // 2. 通知订单退款
        notifyYikeOrderRefund(configDTO, orderRecordDTO.getExternalOrderId(), refundNum);

        // 3. 通知订单状态为 已退款
        notifyYikeOrderStatus(configDTO, orderRecordDTO.getExternalOrderId());
    }
    
    /**
     * 通知亿刻订单状态
     */
    private void notifyYikeOrderStatus(ExternalOrderConfigDTO configDTO, String externalOrderId) {
        try {
            String requestURI = configDTO.getStatusUrl();
            String url = configDTO.getPrefixUrl() + requestURI;
            String appId = configDTO.getAppId();
            String appSecret = configDTO.getAppSecret();
            String appTimestamp = String.valueOf(System.currentTimeMillis() / 1000);
            
            // 使用SHA1Util生成AppToken
            String appToken = SHA1Util.generateAppToken(appId, appSecret, requestURI, appTimestamp);

            JSONObject headers = buildYikeHeaders(appId, appToken, appTimestamp);
            
            JSONObject requestBody = new JSONObject();
            requestBody.put("orderSN", externalOrderId);
            requestBody.put("state", 7); // 6:已退单,7:已退款
            requestBody.put("remarks", "订单退款中");
            
            sendYikeRequest(url, headers, requestBody);
        } catch (Exception e) {
            log.error("Error notifying Yike order status, orderId: " + externalOrderId, e);
        }
    }
    
    /**
     * 通知亿刻订单退单
     */
    private void notifyYikeOrderCancel(ExternalOrderConfigDTO configDTO, String externalOrderId) {
        try {
            String requestURI = configDTO.getCancelUrl();
            String url = configDTO.getPrefixUrl() + requestURI;
            String appId = configDTO.getAppId();
            String appSecret = configDTO.getAppSecret();
            String appTimestamp = String.valueOf(System.currentTimeMillis() / 1000);
            
            // 使用SHA1Util生成AppToken
            String appToken = SHA1Util.generateAppToken(appId, appSecret, requestURI, appTimestamp);

            JSONObject headers = buildYikeHeaders(appId, appToken, appTimestamp);
            
            JSONObject requestBody = new JSONObject();
            requestBody.put("orderSN", externalOrderId);
            requestBody.put("remarks", "订单已退单");
            
            sendYikeRequest(url, headers, requestBody);
        } catch (Exception e) {
            log.error("Error notifying Yike order cancel, orderId: " + externalOrderId, e);
        }
    }
    
    /**
     * 通知亿刻订单退款
     */
    private void notifyYikeOrderRefund(ExternalOrderConfigDTO configDTO, String externalOrderId, long refundNum) {
        try {
            String requestURI = configDTO.getRefundUrl();
            String url = configDTO.getPrefixUrl() + requestURI;
            String appId = configDTO.getAppId();
            String appSecret = configDTO.getAppSecret();
            String appTimestamp = String.valueOf(System.currentTimeMillis() / 1000);
            
            // 使用SHA1Util生成AppToken
            String appToken = SHA1Util.generateAppToken(appId, appSecret, requestURI, appTimestamp);

            JSONObject headers = buildYikeHeaders(appId, appToken, appTimestamp);
            
            JSONObject requestBody = new JSONObject();
            requestBody.put("orderSN", externalOrderId);
            requestBody.put("number", refundNum);
            requestBody.put("remarks", "订单已退款");
            
            sendYikeRequest(url, headers, requestBody);
        } catch (Exception e) {
            log.error("Error notifying Yike order refund, orderId: " + externalOrderId, e);
        }
    }
    
    /**
     * 构建亿刻请求头
     */
    private JSONObject buildYikeHeaders(String appId, String appToken, String appTimestamp) {
        JSONObject headers = new JSONObject();
        headers.put("Appid", appId);
        headers.put("Apptoken", appToken);
        headers.put("AppTimestamp", appTimestamp);
        return headers;
    }
    
    /**
     * 发送请求到亿刻系统
     */
    private void sendYikeRequest(String url, JSONObject headers, JSONObject requestBody) throws Exception {
        okhttp3.Response response = OkHttpUtils.doPost(url, requestBody, "application/json", headers);
        if (!response.isSuccessful()) {
            log.error("Failed to notify Yike system, url: {}, response code: {}", url, response.code());
            return;
        }
        
        String responseBody = response.body().string();
        JSONObject result = JSONObject.parseObject(responseBody);
        
        if (result == null || result.getInteger("code") != 100) {
            log.error("Invalid response from Yike system, url: {}, response: {}", url, responseBody);
            return;
        }
        
        log.info("Successfully notified Yike system, url: {}, request: {}", url, requestBody);
    }

    /**
     * 通知亿刻外部系统更新进度
     */
    private void notifyYikeProgress(OrderRecordDTO orderRecordDTO, OrderEntity orderEntity) {
        ExternalOrderConfigDTO configDTO = externalOrderConfigService.getByChannel(ExternalChannel.YIKE_CHANNEL);
        if (configDTO == null) {
            log.error("External order config not found for channel: {}", ExternalChannel.YIKE_CHANNEL);
            return;
        }

        try {
            String requestURI = configDTO.getProgressUrl();
            String url = configDTO.getPrefixUrl() + requestURI;
            String appId = configDTO.getAppId();
            String appSecret = configDTO.getAppSecret();
            String appTimestamp = String.valueOf(System.currentTimeMillis() / 1000);
            
            // 使用SHA1Util生成AppToken
            String appToken = SHA1Util.generateAppToken(appId, appSecret, requestURI, appTimestamp);

            // 构建请求头
            JSONObject headers = new JSONObject();
            headers.put("Appid", appId);
            headers.put("Apptoken", appToken);
            headers.put("AppTimestamp", appTimestamp);
            
            // 构建请求体
            JSONObject requestBody = new JSONObject();
            requestBody.put("orderSN", orderRecordDTO.getExternalOrderId());
            requestBody.put("startNum", orderEntity.getInitNum());
            requestBody.put("currentNum", orderEntity.getEndNum());
            requestBody.put("remarks", "更新订单进度");
            
            // 发送POST请求
            okhttp3.Response response = OkHttpUtils.doPost(url, requestBody, "application/json", headers);
            if (!response.isSuccessful()) {
                log.error("Failed to notify Yike progress, url: {}, response code: {}", url, response.code());
                return;
            }
            
            // 解析响应
            String responseBody = response.body().string();
            JSONObject result = JSONObject.parseObject(responseBody);
            
            if (result == null || result.getInteger("code") != 100) {
                log.error("Invalid response from Yike system, url: {}, response: {}", url, responseBody);
                return;
            }
            
            log.info("Successfully notified Yike progress for order: {}, startNum: {}, currentNum: {}", 
                orderRecordDTO.getExternalOrderId(), orderEntity.getInitNum(), orderEntity.getEndNum());
            
        } catch (Exception e) {
            log.error("Error notifying Yike progress, orderId: " + orderRecordDTO.getExternalOrderId(), e);
        }
    }
}
