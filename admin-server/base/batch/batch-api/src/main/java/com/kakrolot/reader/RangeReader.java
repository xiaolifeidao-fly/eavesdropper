package com.kakrolot.reader;


import com.kakrolot.processor.RangeBatchProcessor;

import java.util.Collections;
import java.util.List;

/**
 * Created by xianglong on 2018/10/26.
 */
public class RangeReader<I> {

    private RangeBatchProcessor rangeBatchProcessor;

    private Long maxIndex;

    private Long minIndex;

    private int pageSize;

    public RangeReader(RangeBatchProcessor rangeBatchProcessor) {
        this.rangeBatchProcessor = rangeBatchProcessor;
        this.minIndex = buildMinIndex();
        this.maxIndex = buildMaxIndex();
        this.pageSize = rangeBatchProcessor.getReadNum();
    }

    private Long buildMinIndex() {
        Long minIndex = rangeBatchProcessor.getMinId();
        if (minIndex == null) {
            return 0L;
        }
        return minIndex;
    }

    private Long buildMaxIndex() {
        Long maxIndex = rangeBatchProcessor.getMaxId();
        if (maxIndex == null) {
            return 0L;
        }
        return maxIndex + 1;
    }

    public List<I> getData() {
        try {
            rangeBatchProcessor.getReadLock().lock();
            Long currentStartIndex = getCurrentStartIndex();
            if (currentStartIndex > maxIndex) {
                return Collections.emptyList();
            }
            Long currentEndIndex = getCurrentEndIndex();
            if (currentEndIndex > maxIndex) {
                currentEndIndex = maxIndex;
            }
            List<I> list = rangeBatchProcessor.readyData(currentStartIndex, currentEndIndex);
            if (list != null && list.size() > 0) {
                rangeBatchProcessor.increment();
                return list;
            }
            //如果数据为空 且还没有达到最大数 继续轮询拿数据
            while ((list == null || list.size() == 0) && currentEndIndex < maxIndex) {
                rangeBatchProcessor.increment();
                currentStartIndex = getCurrentStartIndex();
                currentEndIndex = getCurrentEndIndex();
                list = rangeBatchProcessor.readyData(currentStartIndex, currentEndIndex);
            }
            if (list != null && list.size() > 0) {
                rangeBatchProcessor.increment();
                return list;
            }
            return list;
        } finally {
            rangeBatchProcessor.getReadLock().unlock();
        }
    }

    private Long getCurrentStartIndex() {
        return minIndex + pageSize * (rangeBatchProcessor.getReadIndex() - 1);
    }

    private Long getCurrentEndIndex() {
        return minIndex + pageSize * rangeBatchProcessor.getReadIndex();
    }
}
