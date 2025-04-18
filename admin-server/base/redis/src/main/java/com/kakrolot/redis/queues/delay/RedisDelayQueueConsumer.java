package com.kakrolot.redis.queues.delay;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.TypeReference;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Set;

@Slf4j
public abstract class RedisDelayQueueConsumer<T> extends AbsRedisDelayQueue<T> {

    private Class<T> clazz;

    private TypeReference<TaskItem<T>> typeReference;

    public RedisDelayQueueConsumer() {
        Type type = this.getClass().getGenericSuperclass();
        if (type instanceof ParameterizedType) {
            ParameterizedType pt = (ParameterizedType) type;
            this.clazz = (Class<T>) pt.getActualTypeArguments()[0];
            typeReference = new TypeReference<TaskItem<T>>(clazz) {
            };
        }
    }

    @Override
    protected void takeMessage(String queueKey) {
        try {
            // 只取一条
            Set<String> values = redisService.zRangeByScore(queueKey, 0, System.currentTimeMillis(), 0, 1);
            if (values.isEmpty()) {
                try {
                    Thread.sleep(500); // 歇会继续
                } catch (InterruptedException e) {
                    return;
                }
                return;
            }
            handlerDelayMessage(queueKey, values);
        } catch (Exception e) {
            log.error("RedisDelayingConsumer handleMsg by error:", e);
        }
    }

    private void handlerDelayMessage(String queueKey, Set<String> values) {
        String s = values.iterator().next();
        if (redisService.zrem(queueKey, s) > 0) { // 抢到了
            try {
                TaskItem<T> task = JSONObject.parseObject(s, typeReference); // fastjson 反序列化
                T msg = task.msg;
                this.handleMsg(msg);
            } catch (Exception e) {
                log.error("RedisDelayingConsumer handleMsg by {} error:", s, e);
            }
        }
    }

}