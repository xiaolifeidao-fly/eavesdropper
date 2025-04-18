package com.kakrolot.order.consumer.ext;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ExtOrderConsumerManager implements InitializingBean {

    @Value("${ext.order.consumer.flag:false}")
    private boolean flag;

    @Value("${kak.order.refund.topic:kak.order.refund.topic}")
    private String refundTopic;

    @Value("${kak.order.update.topic:kak.order.update.topic}")
    private String updateTopic;

    @Autowired
    private ExtUpdateOrderConsumer extUpdateOrderConsumer;

    @Autowired
    private ExtRefundOrderConsumer extRefundOrderConsumer;

    @Override
    public void afterPropertiesSet() throws Exception {
        if (!flag) {
            return;
        }
        extUpdateOrderConsumer.start(updateTopic);
        extRefundOrderConsumer.start(refundTopic);

    }
}
