package com.kakrolot.order.consumer.ext;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.business.service.order.OrderConsumerConfig;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.redis.queues.RedisQueueConsumer;
import com.kakrolot.service.order.api.RefundOrderService;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.order.api.dto.OrderRefundRecordDTO;
import com.kakrolot.service.order.api.dto.OrderStatus;
import com.kakrolot.service.shop.api.dto.ShopCategoryDTO;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ExtRefundOrderConsumer extends AbsExtOrderConsumer {

    @Autowired
    private RefundOrderService refundOrderService;

    @Override
    public void handleMsg(JSONObject message) {
        Long orderId = message.getLong("orderNo");
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderId);
        if (orderRecordDTO == null) {
            log.warn("ExtRefundOrderConsumer not found orderRecordDTO by message {}", message);
            return;
        }
        if (OrderStatus.DONE.name().equals(orderRecordDTO.getOrderStatus()) || OrderStatus.REFUND.name().equals(orderRecordDTO.getOrderStatus())) {
            log.warn("ExtRefundOrderConsumer not allow refund order by message {}", message);
            return;
        }
        ShopCategoryDTO shopCategoryDTO = shopCategoryService.findById(orderRecordDTO.getShopCategoryId());
        if (shopCategoryDTO == null) {
            log.warn("ExtUpdateOrderConsumer not found shopCategoryDTO by message {}", message);
            return;
        }
        Long refundId = getRefundId(orderId, orderRecordDTO, shopCategoryDTO);
        OrderEntity orderEntity = getOrderEntity(message, refundId, orderRecordDTO, OrderStatus.REFUND_HANDING.name());
        orderEntity.setOrderNum(orderRecordDTO.getOrderNum());
        orderEntity.setPrice(orderRecordDTO.getPrice());
        orderQueue.submit(orderEntity, OrderConsumerConfig.UPDATE, orderRecordDTO.getUserId());
    }

    private Long getRefundId(Long orderId, OrderRecordDTO orderRecordDTO, ShopCategoryDTO shopCategoryDTO) {
        OrderRefundRecordDTO orderRefundRecordDTO = refundOrderService.findByOrderId(orderId);
        if (orderRefundRecordDTO != null) {
            return orderRefundRecordDTO.getId();
        }
        orderRefundRecordDTO = buildRefundOrderDTO(orderId, orderRecordDTO.getTenantId(), shopCategoryDTO.getId());
        orderRefundRecordDTO.setOrderRefundStatus(OrderStatus.REFUND_HANDING.name());
        return refundOrderService.save(orderRefundRecordDTO).getId();
    }

    private OrderRefundRecordDTO buildRefundOrderDTO(Long orderId, Long tenantId, Long shopCategoryId) {
        OrderRefundRecordDTO refundRecordDTO = new OrderRefundRecordDTO();
        refundRecordDTO.setOrderId(orderId);
        refundRecordDTO.setTenantId(tenantId);
        refundRecordDTO.setShopCategoryId(shopCategoryId);
        refundRecordDTO.setOrderRefundStatus(OrderStatus.REFUND_PENDING.name());
        return refundRecordDTO;
    }
}


