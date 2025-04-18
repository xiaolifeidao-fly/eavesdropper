package com.kakrolot.common.utils;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.RejectedExecutionHandler;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 线程池拒绝策略处理器
 * 通过队列阻塞主线程,等待线程池中任务处理
 *
 * @author xiaofeidao
 * @date 2018/12/12
 */
@Slf4j
public class RejectedHandler implements RejectedExecutionHandler {

    private LinkedBlockingQueue<Runnable> queue;

    public RejectedHandler(LinkedBlockingQueue<Runnable> queue) {
        this.queue = queue;
    }

    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        try {
            log.info("bladeRejectedHandler reject consumer, the producer is blocking, and the queue.size is {}", queue.size());
            queue.put(r);
            log.info("bladeRejectedHandler the producer resume");
        } catch (Exception e) {
            log.error("bladeRejectedHandler push error :", e);
        }
    }
}
