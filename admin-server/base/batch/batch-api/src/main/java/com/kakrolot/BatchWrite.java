package com.kakrolot;

import com.kakrolot.processor.AbsBatchProcessor;
import com.google.common.base.Stopwatch;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * 写入器
 *
 * @param <O>
 */
@Data
@Slf4j
public class BatchWrite<I, O> {

    private Stopwatch stopwatch = Stopwatch.createStarted();

    private List<O> outputs = new ArrayList<>();

    private AbsBatchProcessor<I, O> batchProcessor;

    private int writeNum;

    private Lock writeLock = new ReentrantLock();


    public BatchWrite(AbsBatchProcessor<I, O> batchProcessor) {
        this.batchProcessor = batchProcessor;
    }

    public void write(O output) {
        writeNum++;
        outputs.add(output);
        //每到边缘点 提交数据
        if (outputs.size() == batchProcessor.getCommitNum()) {
            handlerOutputs();
        }
    }

    private void handlerOutputs() {
        batchProcessor.write(outputs);
        log.info(batchProcessor.getProcessorName() + " write end with {} records, takes {} ms", writeNum, stopwatch.elapsed(TimeUnit.MILLISECONDS));
        outputs.clear();
    }

    /**
     * 同步写入
     */
    public void syncWrite(O output) {
        try {
            writeLock.lock();
            write(output);
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * 写入残留的数据
     */
    public void doFinallyWrite() {
        if (outputs.size() > 0) {
            handlerOutputs();
        }
    }

    /**
     * 同步写入残留的数据
     */
    public void doSyncFinallyWrite() {
        if (outputs.size() > 0) {
            try {
                writeLock.lock();
                doFinallyWrite();
            } finally {
                writeLock.unlock();
            }
        }
    }
}