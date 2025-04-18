package com.kakrolot.redis.queues.delay;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class RedisDelayQueueSubmit extends AbsRedisDelayQueue<Object> {


    @Override
    public void handleMsg(Object message) {

    }

    @Override
    protected void takeMessage(String queueKey) {

    }
}