package com.kakrolot.redis.config;

import lombok.Data;

/**
 * @author caoti
 * @date 2019/12/5
 */
@Data
public class Pool {
    /**最大连接数, 默认8个*/
    private int maxTotal = 8;
    /**最大空闲连接数, 默认8个*/
    private int maxIdle = 8;
    /**最小空闲连接数, 默认0*/
    private int minIdle = 0;
    private long maxWaitMillis;
}