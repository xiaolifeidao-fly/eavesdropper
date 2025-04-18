

package com.kakrolot.processor;

import lombok.Data;

import java.util.List;

/**
 * 批处理业务逻辑抽象类
 * Created by xiaofeidao on 2017/9/7.
 */
@Data
public abstract class ItemProcessor<I> extends BatchProcessor<I, Object> {


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
