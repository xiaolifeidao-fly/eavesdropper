package com.kakrolot.redis.queues;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.redis.util.RedisUtil;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.Map;

@Slf4j
public abstract class AbsRedisQueue<T> {

    @Autowired
    protected RedisUtil redisService;

    private Map<String, QueueTask> queueTaskMap = new HashMap<>();

    public abstract void handleMsg(T message);

    public void submit(String queueKey, T message) {
        redisService.lpush(queueKey, JSONObject.toJSONString(message));
    }

    protected abstract void takeMessage(String queueKey);

    public void start(String queueKey) {
        QueueTask queueTask = new QueueTask(true, queueKey);
        queueTaskMap.put(queueKey, queueTask);
        queueTask.start();
    }

    public void stop(String queueKey) {
        QueueTask queueTask = queueTaskMap.get(queueKey);
        queueTask.setStartFlag(false);
    }

    class QueueTask extends Thread {

        @Setter
        private boolean startFlag;

        private String queueKey;

        public QueueTask(boolean startFlag, String queueKey) {
            this.startFlag = startFlag;
            this.queueKey = queueKey;
        }

        @Override
        public void run() {
            while (startFlag) {
                try {
                    takeMessage(queueKey);
                } catch (Exception e) {
                    log.error("{} takeMessage error:", queueKey, e);
                }
            }
        }
    }
}
