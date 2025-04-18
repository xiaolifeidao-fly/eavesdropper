package com.kakrolot.handler;


import com.kakrolot.processor.AbsBatchProcessor;

/**
 * 初始化句柄
 * Created by xiaofeidao on 2018/4/9.
 */
public abstract class InitProcessorHandler<B extends AbsBatchProcessor> {

    public abstract void init(B batchProcessor);
}
