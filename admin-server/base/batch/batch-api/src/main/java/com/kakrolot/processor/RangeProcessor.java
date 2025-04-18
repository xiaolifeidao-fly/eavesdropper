

package com.kakrolot.processor;

import com.kakrolot.BatchWrite;
import com.kakrolot.logic.RangeBatchProcessorLogic;
import lombok.Data;

import java.lang.reflect.Constructor;
import java.util.List;

/**
 * 批处理业务逻辑抽象类
 * Created by xiaofeidao on 2017/9/7.
 */
@Data
public abstract class RangeProcessor<I> extends RangeBatchProcessor<I, Object> {

    public Constructor<?> getBatchProcessorLogicClazz() {
        try {
            return RangeBatchProcessorLogic.class.getConstructor(RangeBatchProcessor.class, BatchWrite.class);
        } catch (NoSuchMethodException e) {
            throw new RuntimeException(e);
        }
    }

    public abstract List<I> readyData(Long startIndex, Long endIndex);

    public abstract Long getMinId();

    public abstract Long getMaxId();

    public List<I> readyData(int index, int pageSize) {
        return null;
    }

    @Override
    public Object process(I input) {
        processData(input);
        return null;
    }

    protected abstract void processData(I input);

    @Override
    public void write(List<Object> list) {

    }
}
