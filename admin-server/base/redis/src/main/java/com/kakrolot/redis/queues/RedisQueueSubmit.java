package com.kakrolot.redis.queues;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class RedisQueueSubmit extends AbsRedisQueue<Object> {


    @Override
    public void handleMsg(Object message) {

    }

    @Override
    protected void takeMessage(String queueKey) {

    }
}