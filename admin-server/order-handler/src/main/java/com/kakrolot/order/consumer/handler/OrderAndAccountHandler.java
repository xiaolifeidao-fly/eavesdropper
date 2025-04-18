package com.kakrolot.order.consumer.handler;

import com.kakrolot.business.service.ResponseUtils;
import com.kakrolot.business.service.order.OrderConsumerConfig;
import com.kakrolot.business.service.order.OrderQueue;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.business.service.order.support.OrderValidate;
import com.kakrolot.business.service.response.Response;
import com.kakrolot.business.service.user.UserAccountService;
import com.kakrolot.lock.KakrolotLock;
import com.kakrolot.service.account.api.AccountService;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.account.api.dto.AccountLockKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

@Slf4j
public abstract class OrderAndAccountHandler<T> extends OrderHandler<T> {

    @Autowired
    private KakrolotLock kakrolotLock;

    @Autowired
    protected OrderQueue orderQueue;

    @Autowired
    protected OrderValidate orderValidate;

    @Autowired
    protected UserAccountService userAccountService;

    @Autowired
    protected AccountService accountService;

    @Override
    protected void handler(OrderEntity orderEntity, T order) {
        String lockType = AccountLockKey.LOCK_KEY;
        String key = lockType + "_" + orderEntity.getUserId();
        try {
            boolean lockResult = kakrolotLock.lock(lockType, key);
            if (!lockResult) {
                orderQueue.submit(orderEntity, getOrderConsumerConfig(), orderEntity.getUserId());
                return;
            }
        } catch (Exception e) {
            orderQueue.submit(orderEntity, getOrderConsumerConfig(), orderEntity.getUserId());
            log.error("handlerAccount getLock by {} error", key);
            return;
        }
        boolean handlerAccountResult;
        try {
            AccountDTO accountDTO = accountService.findByUserId(orderEntity.getUserId());
            Response response = validate(accountDTO, orderEntity, order);
            if (!ResponseUtils.isSuccess(response)) {
                handlerValidateError(response, orderEntity, order);
                return;
            }
            handlerAccountResult = handlerAccount(accountDTO, orderEntity, order);
        } finally {
            kakrolotLock.unLock(lockType, key);
        }
        if (handlerAccountResult) {
            handlerOrder(orderEntity, order);
        }
    }

    protected abstract Response validate(AccountDTO accountDTO, OrderEntity orderEntity, T order);

    protected abstract void handlerValidateError(Response response, OrderEntity orderEntity, T order);

    protected abstract boolean handlerAccount(AccountDTO accountDTO, OrderEntity orderEntity, T order);

    protected abstract OrderConsumerConfig getOrderConsumerConfig();

    protected abstract void handlerOrder(OrderEntity orderEntity, T order);
}
