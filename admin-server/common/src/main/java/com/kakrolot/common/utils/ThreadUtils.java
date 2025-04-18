package com.kakrolot.common.utils;

import com.google.common.util.concurrent.ListeningExecutorService;
import com.google.common.util.concurrent.MoreExecutors;

/**
 * @author xiaofeidao
 * @date 2019/4/28
 */
public class ThreadUtils {

    private final static int N_THREADS = 20;

    private static ListeningExecutorService taskListeningExecutorService = MoreExecutors
            .listeningDecorator(ThreadFactoryHelper.buildExecutorService(N_THREADS, N_THREADS, "blade-task-"));

    private static ListeningExecutorService autoListeningExecutorService = MoreExecutors
            .listeningDecorator(ThreadFactoryHelper.buildExecutorService(N_THREADS, 1000, "blade-auto-"));

    public static ListeningExecutorService getPool() {
        return taskListeningExecutorService;
    }

    public static ListeningExecutorService getAutoPopl(){
        return autoListeningExecutorService;
    }

}
