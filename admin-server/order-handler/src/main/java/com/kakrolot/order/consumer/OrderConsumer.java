package com.kakrolot.order.consumer;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.kakrolot.business.service.order.OrderConsumerConfig;
import com.kakrolot.business.service.order.OrderQueue;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.order.consumer.handler.OrderHandler;
import com.kakrolot.order.consumer.handler.OrderHandlerConfig;
import com.kakrolot.redis.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
public abstract class OrderConsumer implements InitializingBean {

    @Autowired
    private OrderQueue orderQueue;

    @Value("${kakrolot.order.slaveName:}")
    private String slaveName;

    @Value("${kakrolot.order.consumer.flag:false}")
    private boolean consumerFlag;

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private ApplicationContext applicationContext;

    protected abstract OrderConsumerConfig getOrderConsumerConfig();

    @Override
    public void afterPropertiesSet() throws Exception {
        if (!consumerFlag) {
            return;
        }
        if (!orderQueue.getSlaverNames().contains(slaveName)) {
            log.error("slaverNames {} not contains {}", orderQueue.getSlaverNames(), slaveName);
            throw new RuntimeException("slaverNames not contains");
        }
        initQueue();
    }

    private void initQueue() {
        Map<String, List<String>> map = orderQueue.getSlaverRangeMap().get(slaveName);
        OrderConsumerConfig orderConfig = getOrderConsumerConfig();
        List<String> orderKeys = map.get(orderConfig.name());
        if(orderKeys == null){
            return;
        }
        for (String orderKey : orderKeys) {
            OrderThread orderThread = new OrderThread(orderKey);
            orderThread.start();
        }
    }

    private void consumer(OrderEntity orderEntity) {
        String orderStatus = orderEntity.getOrderStatus();
        OrderHandler orderHandler = getOrderHandler(orderStatus);
        orderHandler.process(orderEntity);
    }

    private OrderHandler getOrderHandler(String orderStatus) {
        OrderHandlerConfig orderHandlerConfig = OrderHandlerConfig.getByOrderStatus(orderStatus);
        return applicationContext.getBean(orderHandlerConfig.getClazz());
    }

    class OrderThread extends Thread {

        private String orderQueueKey;

        public OrderThread(String orderQueueKey) {
            this.orderQueueKey = orderQueueKey;
        }

        @Override
        public void run() {
            while (true) {
                String value = null;
                try {
                    if (!isAllowConsumer()) {
                        Thread.sleep(10000L);
                        continue;
                    }
                    value = redisUtil.rpop(orderQueueKey);
                    if (StringUtils.isBlank(value)) {
                        Thread.sleep(2000L);
                        continue;
                    }
                    log.info("order consumer message {}", value);
                    OrderEntity orderEntity = JSON.toJavaObject(JSONObject.parseObject(value), OrderEntity.class);
                    consumer(orderEntity);
                } catch (Exception e) {
                    log.error("order queue consumer {} error:", value, e);
                }
            }
        }

        private boolean isAllowConsumer() {
            return true;
        }
    }
}
