package com.kakrolot.order.consumer.impl;

import com.kakrolot.business.service.order.OrderConsumerConfig;
import com.kakrolot.order.consumer.OrderConsumer;
import org.springframework.stereotype.Component;

/**
 * 下单
 */
@Component
public class SubmitOrderConsumer extends OrderConsumer {

    @Override
    protected OrderConsumerConfig getOrderConsumerConfig() {
        return OrderConsumerConfig.SUBMIT;
    }
}
