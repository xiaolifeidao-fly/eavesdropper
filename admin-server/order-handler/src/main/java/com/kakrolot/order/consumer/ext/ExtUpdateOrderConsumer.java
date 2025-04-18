package com.kakrolot.order.consumer.ext;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.business.service.order.OrderConsumerConfig;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.order.api.dto.OrderStatus;
import com.kakrolot.service.shop.api.dto.ShopCategoryDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ExtUpdateOrderConsumer extends AbsExtOrderConsumer {

    @Override
    public void handleMsg(JSONObject message) {
        Long orderId = message.getLong("orderNo");
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderId);
        if (orderRecordDTO == null) {
            log.warn("ExtUpdateOrderConsumer not found orderRecordDTO by message {}", message);
            return;
        }
        if (!(OrderStatus.INIT.name().equals(orderRecordDTO.getOrderStatus()) || OrderStatus.PENDING.name().equals(orderRecordDTO.getOrderStatus()))) {
            log.warn("ExtUpdateOrderConsumer not allow update order by message {}", message);
            return;
        }
        ShopCategoryDTO shopCategoryDTO = shopCategoryService.findById(orderRecordDTO.getShopCategoryId());
        if (shopCategoryDTO == null) {
            log.warn("ExtUpdateOrderConsumer not found shopCategoryDTO by message {}", message);
            return;
        }
        String orderStatus = message.getString("status");
        OrderEntity orderEntity = getOrderEntity(message, orderId, orderRecordDTO, orderStatus);
        orderQueue.submit(orderEntity, OrderConsumerConfig.UPDATE, orderRecordDTO.getUserId());
    }


}
