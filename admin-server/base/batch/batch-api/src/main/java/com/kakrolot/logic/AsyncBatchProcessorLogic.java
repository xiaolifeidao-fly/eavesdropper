package com.kakrolot.logic;


import com.kakrolot.BatchWrite;
import com.kakrolot.processor.BatchProcessor;

/**
 * 异步处理器
 *
 * @param <I>
 * @param <O>
 */
public class AsyncBatchProcessorLogic<I, O> extends AbsBatchProcessorLogic<I, O, BatchProcessor<I, O>> {

    public AsyncBatchProcessorLogic(BatchProcessor<I, O> batchProcessor, BatchWrite<I, O> batchWrite) {
        super(batchProcessor, batchWrite);
    }
}