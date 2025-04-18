

package com.kakrolot.processor;

import com.kakrolot.BatchWrite;
import com.kakrolot.logic.AsyncBatchProcessorLogic;
import lombok.Data;

import java.lang.reflect.Constructor;

/**
 * 批处理业务逻辑抽象类
 * Created by xiaofeidao on 2017/9/7.
 */
@Data
public abstract class BatchProcessor<I, O> extends AbsBatchProcessor<I, O> {

    public Constructor<?> getBatchProcessorLogicClazz() {
        try {
            return AsyncBatchProcessorLogic.class.getConstructor(BatchProcessor.class, BatchWrite.class);
        } catch (NoSuchMethodException e) {
            throw new RuntimeException(e);
        }
    }
}
