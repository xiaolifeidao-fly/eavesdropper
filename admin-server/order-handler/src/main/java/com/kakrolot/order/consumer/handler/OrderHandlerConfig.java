package com.kakrolot.order.consumer.handler;

import com.kakrolot.order.consumer.handler.impl.FinishOrderHandler;
import com.kakrolot.order.consumer.handler.impl.RefundOrderHandler;
import com.kakrolot.order.consumer.handler.impl.SubmitOrderHandler;
import com.kakrolot.order.consumer.handler.impl.UpdateOrderHandler;
import com.kakrolot.service.order.api.dto.OrderStatus;
import lombok.Getter;

@Getter
public enum OrderHandlerConfig {

    SUBMIT(OrderStatus.INIT_ING.name(), SubmitOrderHandler.class),
    UPDATE(OrderStatus.PENDING.name(), UpdateOrderHandler.class),
    REFUND(OrderStatus.REFUND_HANDING.name(), RefundOrderHandler.class),
    FINISH(OrderStatus.DONE.name(), FinishOrderHandler.class);

    private String orderStatus;

    private Class<? extends OrderHandler> clazz;

    OrderHandlerConfig(String orderStatus, Class<? extends OrderHandler> clazz) {
        this.orderStatus = orderStatus;
        this.clazz = clazz;
    }

    public static OrderHandlerConfig getByOrderStatus(String orderStatus) {
        OrderHandlerConfig[] orderHandlerConfigs = OrderHandlerConfig.values();
        for (OrderHandlerConfig orderHandlerConfig : orderHandlerConfigs) {
            if (orderHandlerConfig.getOrderStatus().equals(orderStatus)) {
                return orderHandlerConfig;
            }
        }
        return null;
    }
}
