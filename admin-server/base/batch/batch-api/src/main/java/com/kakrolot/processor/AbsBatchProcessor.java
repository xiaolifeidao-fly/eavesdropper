

package com.kakrolot.processor;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Constructor;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * 批处理业务逻辑抽象类
 * Created by xiaofeidao on 2017/9/7.
 */
@Data
@Slf4j
public abstract class AbsBatchProcessor<I, O> {

    //当前读取的页码
    protected volatile int readIndex = 1;

    protected boolean hasNext = true;

    protected AtomicInteger atomicInteger = new AtomicInteger();

    protected int commitNum;

    protected volatile int readNum;

    protected int concurrentNum;

    protected String processorName;

    protected boolean multiThreadWrite = true;

    protected Lock readLock = new ReentrantLock();

    public abstract List<I> readyData(int index, int pageSize);

    public abstract O process(I input);

    public abstract void write(List<O> list);

    public void setHasNext(boolean hasNext) {
        this.hasNext = hasNext;
    }

    public boolean hasNext() {
        return hasNext;
    }

    public void doBefore() {
    }

    public void doAfter() {
    }

    public void doFinally() {
    }

    public void increment() {
        readIndex++;
    }

    public abstract Constructor<?> getBatchProcessorLogicClazz();
}
