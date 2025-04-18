package com.kakrolot.redis.queues.delay;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import com.kakrolot.redis.queues.AbsRedisQueue;
import org.apache.commons.lang3.StringUtils;

import java.lang.reflect.Type;
import java.util.UUID;

public abstract class AbsRedisDelayQueue<T> extends AbsRedisQueue<T> {

    // fastjson 序列化对象中存在 generic 类型时，需要使用 TypeReference
    protected Type taskType = new TypeReference<TaskItem<T>>() {
    }.getType();

    public void delay(String queueKey, T msg, int time) {
        if (StringUtils.isBlank(queueKey)) {
            return;
        }
        TaskItem<T> task = new TaskItem<>();
        task.setId(UUID.randomUUID().toString()); // 分配唯一的 uuid
        task.setMsg(msg);
        String s = JSON.toJSON(task).toString(); // fastjson 序列化
        redisService.zadd(queueKey, System.currentTimeMillis() + time * 1000, s); // 塞入延时队列 ,5s 后再试
    }

}
