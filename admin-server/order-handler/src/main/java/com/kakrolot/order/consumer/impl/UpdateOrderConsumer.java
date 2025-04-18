package com.kakrolot.order.consumer.impl;

import com.kakrolot.business.service.order.OrderConsumerConfig;
import com.kakrolot.order.consumer.OrderConsumer;
import org.springframework.stereotype.Component;

/**
 * 退单
 */
@Component
public class UpdateOrderConsumer extends OrderConsumer {

    @Override
    protected OrderConsumerConfig getOrderConsumerConfig() {
        return OrderConsumerConfig.UPDATE;
    }
}
