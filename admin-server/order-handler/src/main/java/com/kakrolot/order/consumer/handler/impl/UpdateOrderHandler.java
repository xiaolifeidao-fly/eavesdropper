package com.kakrolot.order.consumer.handler.impl;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.common.dto.ExternalChannel;
import com.kakrolot.order.consumer.handler.OrderHandler;
import com.kakrolot.service.order.api.ExternalOrderConfigService;
import com.kakrolot.service.order.api.dto.ExternalOrderConfigDTO;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.order.api.dto.OrderStatus;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.kakrolot.common.utils.SHA1Util;

/**
 * 更新订单
 */
@Component
@Slf4j
public class UpdateOrderHandler extends OrderHandler<OrderRecordDTO> {

    @Autowired
    private ExternalOrderConfigService externalOrderConfigService;

    @Override
    protected OrderRecordDTO toRecord(OrderEntity orderEntity) {
        return orderRecordService.findById(orderEntity.getId());
    }

    @Override
    protected void handler(OrderEntity orderEntity, OrderRecordDTO orderRecordDTO) {
        if (!(OrderStatus.INIT.name().equals(orderRecordDTO.getOrderStatus()) || OrderStatus.PENDING.name().equals(orderRecordDTO.getOrderStatus()))) {
            log.warn("update order num error by {} ", orderRecordDTO);
            return;
        }
        Long endNum = orderEntity.getEndNum();
        if(endNum < 0){
            endNum = 0L;
        }
        orderRecordService.updateOrderStatusAndInitNumAndEndNumById(OrderStatus.PENDING.name(), orderEntity.getInitNum(), endNum, orderRecordDTO.getId());
        
        // External 通知外部系统更新进度
        notifyExternalSystem(orderRecordDTO, orderEntity);
    }

    /**
     * 通知外部系统订单状态
     * 根据不同的channel调用不同的通知方法
     */
    private void notifyExternalSystem(OrderRecordDTO orderRecordDTO, OrderEntity orderEntity) {
        String channel = orderRecordDTO.getChannel();
        if (StringUtils.isBlank(channel)) {
            log.debug("Order is not from external system, skip notification");
            return;
        }
        
        switch (channel) {
            case ExternalChannel.YIKE_CHANNEL:
                notifyYikeProgress(orderRecordDTO, orderEntity);
                break;
            default:
                log.warn("Unsupported external channel: {}", channel);
                break;
        }
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
