package com.kakrolot.lock;

import com.kakrolot.redis.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Created by xianglong on 2018/10/18.
 */
@Slf4j
@Component
public class KakrolotLockImpl implements KakrolotLock {

    @Autowired
    private RedisUtil redisUtil;

    private static final String LOCK = "kakrolot_";

    private static final int timeUnit = 1000;

    private static final int maxWaitTimes = 15;

    private static final int defaultTimeOut = 10;

    @Override
    public boolean lock(String lockType, Object key) {
        return lock(lockType, key, defaultTimeOut);
    }

    @Override
    public boolean lock(String lockType, Object key, int timeOut) {
        String lockKey = buildLockKey(lockType, key);
        try {
            int result = redisUtil.set(lockKey, "1", "NX", "EX", timeOut);
            int maxTimes = maxWaitTimes;
            while (result != 1 && maxTimes > 0) {
                Thread.sleep(timeUnit);
                result = redisUtil.set(lockKey, "1", "NX", "EX", timeOut);
                maxTimes--;
            }
            return result == 1;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String buildLockKey(String lockType, Object key) {
        return LOCK + "_" + lockType + "_" + key;
    }

    @Override
    public void unLock(String lockType, Object key) {
        String lockKey = buildLockKey(lockType, key);
        try {
            redisUtil.del(lockKey);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


}
