package com.kakrolot.order.consumer.handler.impl;

import com.kakrolot.business.service.ext.ExtPlugin;
import com.kakrolot.business.service.order.OrderConsumerConfig;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.business.service.response.Response;
import com.kakrolot.common.utils.AmountUtils;
import com.kakrolot.order.consumer.handler.OrderAndAccountHandler;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.account.api.dto.AmountType;
import com.kakrolot.service.order.api.dto.OrderAmountDetailDTO;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.order.api.dto.OrderStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * 下单
 */
@Slf4j
@Component
public class SubmitOrderHandler extends OrderAndAccountHandler<OrderRecordDTO> {

    @Autowired
    private ExtPlugin extPlugin;

    @Override
    protected OrderRecordDTO toRecord(OrderEntity orderEntity) {
        return orderRecordService.findById(orderEntity.getId());
    }

    @Override
    protected Response validate(AccountDTO accountDTO, OrderEntity orderEntity, OrderRecordDTO orderRecordDTO) {
        return orderValidate.validate(accountDTO, orderRecordDTO.getOrderAmount());
    }

    @Override
    protected void handlerValidateError(Response response, OrderEntity orderEntity, OrderRecordDTO orderRecordDTO) {
        orderRecordDTO.setOrderStatus(OrderStatus.ERROR.name());
        orderRecordDTO.setDescription(response.getMessage());
        orderRecordService.save(orderRecordDTO);
    }

    @Override
    protected boolean handlerAccount(AccountDTO accountDTO, OrderEntity orderEntity, OrderRecordDTO orderRecordDTO) {
        orderRecordDTO.setOrderStatus(OrderStatus.INIT.name());
        orderRecordDTO.setDescription(OrderStatus.INIT.getDesc());
        orderRecordService.save(orderRecordDTO);
        try {
            extPlugin.inletToBarry(orderRecordDTO);
        } catch (Exception e) {
            log.error("SubmitOrderHandler inletToBarry by {} error:", orderRecordDTO, e);
            orderQueue.submit(orderEntity, getOrderConsumerConfig(), orderEntity.getUserId());
            return false;
        }
        String businessId = OrderConsumerConfig.SUBMIT.name() + "_" + orderRecordDTO.getId();
        userAccountService.handlerAmount(accountDTO, orderRecordDTO.getOrderAmount(), orderEntity.getIp(), orderEntity.getOperator(), AmountType.CONSUMER, businessId,orderRecordDTO.getId());
        return true;
    }

    @Override
    protected OrderConsumerConfig getOrderConsumerConfig() {
        return OrderConsumerConfig.SUBMIT;
    }

    @Override
    protected void handlerOrder(OrderEntity orderEntity, OrderRecordDTO orderRecordDTO) {
        saveAmountDetail(orderRecordDTO, orderEntity);
    }

    private void saveAmountDetail(OrderRecordDTO orderRecordDTO, OrderEntity orderEntity) {
        OrderAmountDetailDTO orderAmountDetailDTO = new OrderAmountDetailDTO();
        orderAmountDetailDTO.setDescription("消费金额:" + orderRecordDTO.getOrderAmount().toString() + "元");
        orderAmountDetailDTO.setOrderId(orderRecordDTO.getId());
        orderAmountDetailDTO.setOrderConsumerAmount(orderRecordDTO.getOrderAmount());
        orderAmountDetailDTO.setUpdateBy(orderEntity.getOperator());
        orderAmountDetailDTO.setCreateBy(orderEntity.getOperator());
        orderAmountDetailService.save(orderAmountDetailDTO);
    }

}
