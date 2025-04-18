package com.kakrolot.order.consumer;

import com.kakrolot.business.service.ext.ExtPlugin;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.order.consumer.handler.impl.RefundOrderHandler;
import com.kakrolot.service.order.api.RefundOrderService;
import com.kakrolot.service.order.api.dto.*;
import com.kakrolot.service.order.api.dto.yike.YikeOrderListResponse;
import com.kakrolot.service.order.api.OrderRecordService;
import com.kakrolot.service.order.api.ExternalYikeGoodsMappingService;
import com.kakrolot.service.order.api.ExternalOrderConfigService;
import com.kakrolot.common.dto.ExternalChannel;
import com.kakrolot.common.utils.SHA1Util;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.alibaba.fastjson.JSONObject;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;

/**
 * 亿科退单轮询
 * 调用亿科的订单列表查询接口 查找退单中的订单 然后调用本系统的退单方法
 */
@Component
@Slf4j
public class YkOrderCheck implements SmartLifecycle {

    @Autowired
    private OrderRecordService orderRecordService;

    @Autowired
    private ExternalOrderConfigService externalOrderConfigService;

    @Autowired
    private ExternalYikeGoodsMappingService externalYikeGoodsMappingService;

    @Autowired
    private RefundOrderService refundOrderService;

    @Autowired
    private RefundOrderHandler refundOrderHandler;

    @Autowired
    private ExtPlugin extPlugin;
    
    private static final int REFUND_STATE = 5;

    private static final int limit = 100;

    public void startCheck() {
        // External 轮询亿科退单中的订单
        while (true) {
            try {
                // 获取所有的商品映射
                List<ExternalYikeGoodsMappingDTO> goodsMappings = externalYikeGoodsMappingService.getAll();

                for (ExternalYikeGoodsMappingDTO goodsMapping : goodsMappings) {
                    String goodsSN = goodsMapping.getGoodsId();
                    int page = 1;
                    boolean hasMore = true;

                    while (hasMore) {
                        hasMore = fetchAndProcessRefundOrders(goodsSN, page);
                        page++;
                    }
                }

                // 休眠一段时间，避免频繁查询
                Thread.sleep(5000); // 5s查询一次

            } catch (Exception e) {
                log.error("Error in monitoring refund orders", e);
            }
        }
    }

    private boolean fetchAndProcessRefundOrders(String goodsSN, int page) {
        try {
            ExternalOrderConfigDTO configDTO = externalOrderConfigService.getByChannel(ExternalChannel.YIKE_CHANNEL);
            if (configDTO == null) {
                log.error("External order config not found for channel: YIKE_CHANNEL");
                return false;
            }

            String requestURI = configDTO.getOrderListUrl() + "?page=" + page + "&goodsSN=" + goodsSN + "&state=" + REFUND_STATE + "&limit=" + limit;
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

            // 发送GET请求
            Response response = OkHttpUtils.doGet(url, headers);
            if (!response.isSuccessful()) {
                log.error("Failed to get order list from Yike system, url: {}, response code: {}", url, response.code());
                return false;
            }

            // 解析响应
            String responseBody = response.body().string();
            YikeOrderListResponse listResponse = JSONObject.parseObject(responseBody, YikeOrderListResponse.class);

            if (listResponse == null || listResponse.getCode() != 100 || listResponse.getResult() == null) {
                log.error("Invalid response for order list, url: {}, response: {}", url, responseBody);
                return false;
            }

            // 处理每个退单中的订单
            for (YikeOrderListResponse.OrderDetailResult orderDetail : listResponse.getResult().getData()) {
                OrderRecordDTO order = orderRecordService.findByChannelAndExternalOrderId(ExternalChannel.YIKE_CHANNEL, orderDetail.getOrderSN());
                if (order != null) {
                    processRefund(order);
                }
            }

            // 判断是否还有更多页
            int currentPageSize = listResponse.getResult().getData().size();
            return currentPageSize == limit;

        } catch (Exception e) {
            log.error("Error fetching refund orders from Yike system, goodsSN: " + goodsSN, e);
            return false;
        }
    }

    private void processRefund(OrderRecordDTO order) {
        // 在本地系统中执行退单操作
        Long orderId = order.getId();
        String externalOrderId = order.getExternalOrderId();
        log.info("Processing refund for order: {} extOrder:{}", orderId,externalOrderId);
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderId);
        if (orderRecordDTO == null) {
            log.error("OrderRecordDTO is null: {} extOrder:{}", orderId,externalOrderId);
            return;
        }
        String orderStatus = orderRecordDTO.getOrderStatus();
        //自己系统已退单  但是对方系统还没退的话手动更新到对方系统
        if  (OrderStatus.REFUND.name().equals(orderStatus)){
            callRefundOrderHandler(orderRecordDTO);
            return ;
        }
        if (!(OrderStatus.PENDING.name().equals(orderStatus) || OrderStatus.INIT.name().equals(orderStatus))) {
            log.error("订单不允许退单: {} extOrder:{}", orderId,externalOrderId);
            return;
        }
        Long num = refundOrderService.countByOrderId(orderId);
        if (num > 0) {
            log.error("不允许重复退单: {} extOrder:{}", orderId,externalOrderId);
            return;
        }
        extPlugin.refundToBarry(orderId);
        refundOrderService.save(buildRefundOrderDTO(orderId, orderRecordDTO.getTenantId(), orderRecordDTO.getShopCategoryId()));
        log.info("Done refund for order: {} extOrder:{}", orderId,externalOrderId);
    }

    private void callRefundOrderHandler(OrderRecordDTO order){
        Long endNum = order.getEndNum();
        if (endNum < 0) {
            endNum = 0L;
        }
        Long cha = endNum - order.getInitNum();
        if (cha < 0) {
            cha = 0L;
        }
        long refundNum = order.getOrderNum() - cha;
        if (refundNum < 0) {
            refundNum = 0L;
        }
        OrderEntity orderEntity = new OrderEntity();
        orderEntity.setInitNum(order.getInitNum());
        orderEntity.setOrderNum(order.getOrderNum());
        orderEntity.setEndNum(order.getEndNum());
        refundOrderHandler.notifyExternalSystem(order,refundNum,orderEntity);
    }

    private OrderRefundRecordDTO buildRefundOrderDTO(Long orderId, Long tenantId, Long shopCategoryId) {
        OrderRefundRecordDTO refundRecordDTO = new OrderRefundRecordDTO();
        refundRecordDTO.setOrderId(orderId);
        refundRecordDTO.setTenantId(tenantId);
        refundRecordDTO.setShopCategoryId(shopCategoryId);
        refundRecordDTO.setOrderRefundStatus(OrderStatus.REFUND_PENDING.name());
        refundRecordDTO.setRefundAmount(BigDecimal.ZERO);
        return refundRecordDTO;
    }

      @Override
    public boolean isAutoStartup() {
        return true;
    }

    @Override
    public void stop(Runnable callback) {

    }

    @Override
    public void start() {
        log.info("start check yk order");
        new Thread(()->{
            startCheck();
        }).start();
        log.info("start check yk order success");
    }

    @Override
    public void stop() {
    }

    @Override
    public boolean isRunning() {
        return false;
    }

    @Override
    public int getPhase() {
        return 0;
    }

}
