package com.kakrolot.order.consumer.handler.impl;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.common.dto.ExternalChannel;
import com.kakrolot.order.consumer.handler.OrderHandler;
import com.kakrolot.order.consumer.handler.asign.AssignHandler;
import com.kakrolot.service.order.api.ExternalOrderConfigService;
import com.kakrolot.service.order.api.dto.ExternalOrderConfigDTO;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.order.api.dto.OrderStatus;
import com.kakrolot.common.utils.SHA1Util;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * 完成
 */
@Component
@Slf4j
public class FinishOrderHandler extends OrderHandler<OrderRecordDTO> {

    @Autowired
    private AssignHandler assignHandler;
    
    @Autowired
    private ExternalOrderConfigService externalOrderConfigService;

    @Override
    protected OrderRecordDTO toRecord(OrderEntity orderEntity) {
        return orderRecordService.findById(orderEntity.getId());
    }

    @Override
    protected void handler(OrderEntity orderEntity, OrderRecordDTO orderRecordDTO) {
        if (!(OrderStatus.INIT.name().equals(orderRecordDTO.getOrderStatus()) || OrderStatus.PENDING.name().equals(orderRecordDTO.getOrderStatus()))) {
            log.warn("finish order num error by {} ", orderRecordDTO);
            return;
        }
        if(orderRecordDTO.getInitNum() == null){
            orderRecordDTO.setInitNum(orderEntity.getInitNum());
        }
        Long finishNum = orderEntity.getEndNum() - orderEntity.getInitNum();
        OrderStatus orderStatus = OrderStatus.PENDING;
        if (finishNum >= orderRecordDTO.getOrderNum()) {
            orderStatus = OrderStatus.DONE;
        }
        orderRecordService.updateOrderStatusAndInitNumAndEndNumById(orderStatus.name(), orderRecordDTO.getInitNum(), orderEntity.getEndNum(), orderRecordDTO.getId());
        
        // External 订单完成时通知对方系统
        notifyExternalSystem(orderRecordDTO,orderEntity);
    }

    @Override
    protected void afterHandler(OrderRecordDTO orderRecordDTO, OrderEntity orderEntity) {
        assignHandler.assign(orderRecordDTO.getId(), orderRecordDTO.getShopId(), orderRecordDTO.getOrderNum());
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
                notifyYikeExternalSystem(orderRecordDTO.getExternalOrderId());
                notifyYikeProgress(orderRecordDTO, orderEntity);
                break;
            // 可以在这里添加其他渠道的处理方法
            // case ExternalChannel.OTHER_CHANNEL:
            //     notifyOtherExternalSystem(orderRecordDTO);
            //     break;
            default:
                log.warn("Unsupported external channel: {}", channel);
                break;
        }
    }
    
    /**
     * 通知亿刻外部系统订单状态
     * -1:待付款,1:已付款,2:处理中,3:异常,4.已完成,5:退单中,6:已退单,7:已退款,8:待处理
     */
    private void notifyYikeExternalSystem(String externalOrderId) {
        ExternalOrderConfigDTO configDTO = externalOrderConfigService.getByChannel(ExternalChannel.YIKE_CHANNEL);
        if (configDTO == null) {
            log.error("External order config not found for channel: {}", ExternalChannel.YIKE_CHANNEL);
            return;
        }
        
        String requestURI = configDTO.getStatusUrl();
        String url = configDTO.getPrefixUrl() + requestURI;
        String appId = configDTO.getAppId();
        String appSecret = configDTO.getAppSecret();
        String appTimestamp = String.valueOf(System.currentTimeMillis() / 1000);
        
        // 使用SHA1Util生成AppToken
        String appToken = SHA1Util.generateAppToken(appId, appSecret, requestURI, appTimestamp);
        
        try {
            // 构建请求头
            JSONObject headers = new JSONObject();
            headers.put("Appid", appId);
            headers.put("Apptoken", appToken);
            headers.put("AppTimestamp", appTimestamp);
            
            // 构建请求体
            JSONObject requestBody = new JSONObject();
            requestBody.put("orderSN", externalOrderId);
            requestBody.put("state", 4); // 4表示已完成状态
            requestBody.put("remarks", "订单已完成"); // 备注信息
            
            // 发送POST请求
            Response response = OkHttpUtils.doPost(url, requestBody, "application/json", headers);
            if (!response.isSuccessful()) {
                log.error("Failed to notify Yike system, url: {}, response code: {}", url, response.code());
                return;
            }
            
            // 解析响应
            String responseBody = response.body().string();
            JSONObject result = JSONObject.parseObject(responseBody);
            
            if (result == null || result.getInteger("code") != 100) {
                log.error("Invalid response from Yike system, url: {}, response: {}", url, responseBody);
                return;
            }
            
            log.info("Successfully notified Yike system for order: {}", externalOrderId);
            
        } catch (Exception e) {
            log.error("Error notifying Yike system, url: " + url, e);
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
