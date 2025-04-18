package com.kakrolot.logic;


import com.kakrolot.BatchWrite;
import com.kakrolot.processor.RangeBatchProcessor;
import com.kakrolot.reader.RangeReader;

import java.util.List;

/**
 *
 * @author xiaofeidao
 * @date 2018/10/26
 */
public class RangeBatchProcessorLogic<I, O> extends AbsBatchProcessorLogic<I, O, RangeBatchProcessor<I,O>> {


    private RangeReader<I> rangeReader;

    public RangeBatchProcessorLogic(RangeBatchProcessor<I, O> rangeBatchProcessor, BatchWrite<I, O> batchWrite) {
        super(rangeBatchProcessor, batchWrite);
        this.rangeReader = new RangeReader<>(rangeBatchProcessor);
    }

    protected int process() {
        List<I> list = rangeReader.getData();
        while (list != null && list.size() > 0) {
            for (I input : list) {
                O output = buildOutput(input);
                if (output == null) {
                    //输出结果为空 直接过滤
                    continue;
                }
                handlerOutput(output);
            }
            //再次读取数据
            list = rangeReader.getData();
        }
        doFinallyHandlerOutput();
        return atomicInteger.get();
    }
}
