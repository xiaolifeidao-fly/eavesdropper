package com.kakrolot.helper;




import com.kakrolot.processor.AbsBatchProcessor;
import com.kakrolot.processor.BatchProcessor;

import java.util.List;

/**
 * 测试batch
 * Created by xiaofeidao on 2017/11/15.
 */
public abstract class BatchHelperProcessor<I, O> extends BatchProcessor<I, O> {

    private AbsBatchProcessor<I, O> batchProcessor;

    public BatchHelperProcessor(AbsBatchProcessor<I, O> batchProcessor) {
        this.batchProcessor = batchProcessor;
    }

    @Override
    public void doBefore() {
        batchProcessor.doBefore();

    }

    @Override
    public O process(I input) {
        return batchProcessor.process(input);
    }

    @Override
    public void write(List<O> list) {
        batchProcessor.write(list);
    }

    @Override
    public void doAfter() {
        batchProcessor.doAfter();
    }

    @Override
    public void doFinally() {
        batchProcessor.doFinally();
    }
}
