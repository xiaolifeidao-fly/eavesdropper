package com.kakrolot.common.utils;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * 线程池帮助类
 * @author xiaofeidao
 * @date 2018/12/12
 */
public class ThreadFactoryHelper {

    private static final int MAX_THREAD_NUM = 50;

    private static final int THREAD_NUM = 10;

    public static ExecutorService buildExecutorService(int threadNum, int queueSize, String poolName) {
        if (threadNum > THREAD_NUM) {
            threadNum = THREAD_NUM;
        }
        LinkedBlockingQueue<Runnable> queue = new LinkedBlockingQueue<>(queueSize);
        return new ThreadPoolExecutor(threadNum, MAX_THREAD_NUM,
                0L, TimeUnit.MILLISECONDS,
                queue, new BladeThreadFactory(poolName), new RejectedHandler(queue));
    }
}
