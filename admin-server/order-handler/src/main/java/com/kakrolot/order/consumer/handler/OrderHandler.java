package com.kakrolot.order.consumer.handler;

import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.service.order.api.OrderAmountDetailService;
import com.kakrolot.service.order.api.OrderRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

public abstract class OrderHandler<T> {

    @Autowired
    protected OrderRecordService orderRecordService;

    @Autowired
    protected OrderAmountDetailService orderAmountDetailService;


    public void process(OrderEntity orderEntity) {
        T order = toRecord(orderEntity);
        beforeHandler(order, orderEntity);
        doHandler(orderEntity, order);
        afterHandler(order, orderEntity);
    }

    protected void afterHandler(T order, OrderEntity orderEntity) {

    }

    protected void beforeHandler(T order, OrderEntity orderEntity) {

    }

    @Transactional
    public void doHandler(OrderEntity orderEntity, T order) {
        handler(orderEntity, order);
    }

    protected abstract T toRecord(OrderEntity orderEntity);

    protected abstract void handler(OrderEntity orderEntity, T order);


}
