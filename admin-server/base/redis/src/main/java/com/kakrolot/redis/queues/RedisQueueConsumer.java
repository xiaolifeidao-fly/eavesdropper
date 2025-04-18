package com.kakrolot.redis.queues;

import com.alibaba.fastjson.JSON;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

@Slf4j
public abstract class RedisQueueConsumer<T> extends AbsRedisQueue<T> {

    private Class<T> type;

    public RedisQueueConsumer() {
        Type type = this.getClass().getGenericSuperclass();
        if (type instanceof ParameterizedType) {
            ParameterizedType pt = (ParameterizedType) type;
            this.type = (Class<T>) pt.getActualTypeArguments()[0];
        }
    }

    protected void takeMessage(String queueKey) {
        try {
            // 只取一条
            String value = redisService.rpop(queueKey);
            if (StringUtils.isBlank(value)) {
                try {
                    Thread.sleep(1000); // 歇会继续
                } catch (InterruptedException e) {
                    return;
                }
                return;
            }
            handlerMessage(value);
        } catch (Exception e) {
            log.error("{} consumer message by error:", this.getClass().getName(), e);
        }
    }

    private void handlerMessage(String value) {
        T message;
        try {
            message = JSON.parseObject(value, type); // fastjson 反序列化
            this.handleMsg(message);
        } catch (Exception e) {
            log.error("{} consumer message by {} error:", this.getClass().getName(), value, e);
        }
    }

}