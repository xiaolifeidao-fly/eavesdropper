package com.kakrolot;

import com.kakrolot.processor.AbsBatchProcessor;
import com.google.common.base.Stopwatch;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;


/**
 * 读取器
 *
 * @param <I>
 */
@Data
@Slf4j
public class BatchReader<I> {
    private boolean flag = true;

    private AbsBatchProcessor batchProcessor;

    //当前数据节点的读取下标
    private int currentReaderIndex = 0;

    //当前数据节点的数据集
    private List<I> results = new ArrayList<>();

    //当前数据节点的数据个数
    private int resultNum;

    private Stopwatch stopwatch = Stopwatch.createStarted();

    public BatchReader(AbsBatchProcessor batchProcessor) {
        this.batchProcessor = batchProcessor;
    }

    public I read() {
        //数据读取到边缘点 重置起点
        if (this.currentReaderIndex >= resultNum) {
            this.currentReaderIndex = 0;
            if (results != null) {
                results.clear();
                results = null;
            }
        }
        //判断数据是否读取完
        if (results == null || results.size() == 0) {
            //准备下一节点的数据
            results = readyData();
            //所有节点数据已读取完
            if (results == null || results.size() == 0) {
                return null;
            }
        }
        int next = this.currentReaderIndex;
        this.currentReaderIndex++;
        return next < this.results.size() ? this.results.get(next) : null;
    }

    /**
     * 准备数据
     *
     * @return list
     */
    private List<I> readyData() {
        if (batchProcessor.hasNext()) {
            try {
                batchProcessor.getReadLock().lock();
                if (batchProcessor.hasNext()) {
                    List<I> list = batchProcessor.readyData(batchProcessor.getReadIndex(), batchProcessor.getReadNum());
                    log.info(batchProcessor.getProcessorName() + " reader end with {} records, takes {} ms", batchProcessor.getReadNum(),stopwatch.elapsed(TimeUnit.MILLISECONDS));
                    batchProcessor.increment();
                    if (list == null || list.size() == 0) {
                        batchProcessor.setHasNext(false);
                    }
                    if (list != null) {
                        resultNum = list.size();
                    }
                    return list;
                }
            } finally {
                batchProcessor.getReadLock().unlock();
            }
        }
        return null;
    }
}