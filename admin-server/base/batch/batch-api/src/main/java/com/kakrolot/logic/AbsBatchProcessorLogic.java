package com.kakrolot.logic;

import com.kakrolot.BatchReader;
import com.kakrolot.BatchWrite;
import com.kakrolot.processor.AbsBatchProcessor;
import com.google.common.base.Stopwatch;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 异步处理器
 *
 * @param <I>
 * @param <O>
 */
@Data
@Slf4j
public abstract class AbsBatchProcessorLogic<I, O, P extends AbsBatchProcessor<I, O>> implements Callable<Integer> {

    protected Stopwatch stopwatch = Stopwatch.createStarted();

    protected BatchReader<I> batchReader;

    protected P batchProcessor;

    protected BatchWrite<I, O> batchWrite;

    protected AtomicInteger atomicInteger = new AtomicInteger();

    protected int writeNum;

    public AbsBatchProcessorLogic(P batchProcessor, BatchWrite<I, O> batchWrite) {
        this.batchProcessor = batchProcessor;
        initBatchReader(batchProcessor);
        initBatchWrite(batchProcessor, batchWrite);
    }

    private void initBatchReader(AbsBatchProcessor<I, O> batchProcessor) {
        this.batchReader = new BatchReader<>(batchProcessor);
    }

    private void initBatchWrite(AbsBatchProcessor<I, O> batchProcessor, BatchWrite<I, O> batchWrite) {
        if (batchProcessor.isMultiThreadWrite()) {
            this.batchWrite = new BatchWrite<>(batchProcessor);
            return;
        }
        this.batchWrite = batchWrite;
    }

    protected int process() {
        I input = batchReader.read();
        while (input != null) {
            O output = buildOutput(input);
            if (output == null) {
                //输出结果为空 直接过滤
                input = batchReader.read();
                continue;
            }
            handlerOutput(output);
            //再次读取数据
            input = batchReader.read();
        }
        doFinallyHandlerOutput();
        return atomicInteger.get();
    }

    @Override
    public Integer call() throws Exception {
        return process();
    }

    public void doFinallyHandlerOutput() {
        //判断是否需要多线程 写入未完成的数据
        if (batchProcessor.isMultiThreadWrite()) {
            batchWrite.doFinallyWrite();
        } else {
            batchWrite.doSyncFinallyWrite();
        }
    }

    public void handlerOutput(O output) {
        //判断是否需要多线程写入
        if (batchProcessor.isMultiThreadWrite()) {
            batchWrite.write(output);
        } else {
            batchWrite.syncWrite(output);
        }
    }

    public O buildOutput(I input) {
        try {
            int processNum = batchProcessor.getAtomicInteger().incrementAndGet();
            //处理数据
            if (processNum % batchProcessor.getReadNum() == 0) {
                log.info(batchProcessor.getProcessorName() + " AsyncBatchProcessor.process end with {} records, takes {} ms", processNum, stopwatch.elapsed(TimeUnit.MILLISECONDS));
            }
            return batchProcessor.process(input);
        } catch (Exception e) {
            log.error("AsyncBatchProcessor error:", e);
            throw new RuntimeException(e);
        }
    }
}