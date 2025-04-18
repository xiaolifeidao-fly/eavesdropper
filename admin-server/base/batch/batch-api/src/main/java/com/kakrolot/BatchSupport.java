package com.kakrolot;

import com.kakrolot.logic.AbsBatchProcessorLogic;
import com.kakrolot.processor.AbsBatchProcessor;
import com.google.common.base.Stopwatch;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/**
 * batch多线程实现
 * Created by xianglong on 2017/9/7.
 */
@Slf4j
public class BatchSupport implements InitializingBean {

    @Value("${blade.job.task.case.process.readNum:5000}")
    private int readNum;

    @Value("${blade.job.task.case.process.concurrentNum:10}")
    private int concurrentNum;

    @Value("${blade.job.task.case.process.maxConcurrentNum:100}")
    private int maxConcurrentNum;

    @Value("${blade.job.task.case.process.commitNum:5000}")
    private int commitNum;

    private ExecutorService executorService;

    /**
     * 批量处理
     */
    public <I, O, P extends AbsBatchProcessor<I, O>> void doBatchExecute(AbsBatchProcessor<I, O> batchProcessor) {
        try {
            //初始化相关参数
            initProcessor(batchProcessor);
            Stopwatch stopwatch = Stopwatch.createStarted();
            log.info(batchProcessor.getProcessorName() + " doBatchExecute start");
            //前置处理
            batchProcessor.doBefore();
            BatchWrite<I, O> batchWrite = new BatchWrite<>(batchProcessor);
            //读取器
            List<AbsBatchProcessorLogic<I, O, P>> batchProcessorLogicList = getBatchProcessorLogicList(batchProcessor, batchWrite);
            List<Future<Integer>> results = getFutures(batchProcessorLogicList);
            int processSumNum = getProcessSumNum(batchProcessor, results);
            //后置处理
            batchProcessor.doAfter();
            log.info(batchProcessor.getProcessorName() + " doBatchExecute process {} records, takes {} ms", processSumNum, stopwatch.elapsed(TimeUnit.MILLISECONDS));
        } catch (Exception e) {
            log.error("doBatchExecute error:", e);
            throw new RuntimeException(e);
        } finally {
            //最终处理
            batchProcessor.doFinally();
        }
    }


    @Override
    public void afterPropertiesSet() throws Exception {
        executorService = Executors.newFixedThreadPool(maxConcurrentNum);
    }

    private <I, O> int getProcessSumNum(AbsBatchProcessor<I, O> batchProcessor, List<Future<Integer>> results) throws InterruptedException, java.util.concurrent.ExecutionException {
        int processSumNum = 0;
        //等待回调结果
        for (Future<Integer> future : results) {
            int processNum = future.get();
            processSumNum += processNum;
            log.info(batchProcessor.getProcessorName() + " processNum :" + processNum);
        }
        return processSumNum;
    }

    private <I, O, P extends AbsBatchProcessor<I, O>> List<Future<Integer>> getFutures(List<AbsBatchProcessorLogic<I, O, P>> batchProcessorLogicList) {
        List<Future<Integer>> results = new LinkedList<>();
        for (AbsBatchProcessorLogic absBatchProcessorLogic : batchProcessorLogicList) {
            Future<Integer> result = executorService.submit(absBatchProcessorLogic);
            results.add(result);
        }
        return results;
    }

    private <I, O, P extends AbsBatchProcessor<I, O>> List<AbsBatchProcessorLogic<I, O, P>> getBatchProcessorLogicList(AbsBatchProcessor<I, O> batchProcessor, BatchWrite<I, O> batchWrite) throws InstantiationException, IllegalAccessException, java.lang.reflect.InvocationTargetException, NoSuchMethodException {
        List<AbsBatchProcessorLogic<I, O, P>> batchProcessorLogicList = new ArrayList<>();
        for (int num = 0; num < batchProcessor.getConcurrentNum(); num++) {
            //异步处理器
            AbsBatchProcessorLogic<I, O, P> asyncBatchProcessorLogic = (AbsBatchProcessorLogic<I, O, P>) batchProcessor.getBatchProcessorLogicClazz().newInstance(batchProcessor, batchWrite);
            batchProcessorLogicList.add(asyncBatchProcessorLogic);
        }
        return batchProcessorLogicList;
    }

    /**
     * 初始化处理器的参数
     *
     * @param batchProcessor 处理器逻辑实现
     * @param <I>            输入
     * @param <O>            输出
     */
    private <I, O> void initProcessor(AbsBatchProcessor<I, O> batchProcessor) {
        int commitNum = batchProcessor.getCommitNum();
        int concurrentNum = batchProcessor.getConcurrentNum();
        int readNum = batchProcessor.getReadNum();
        if (commitNum == 0) {
            batchProcessor.setCommitNum(this.commitNum);
        }
        if (concurrentNum == 0) {
            batchProcessor.setConcurrentNum(this.concurrentNum);
        }
        if (readNum == 0) {
            batchProcessor.setReadNum(this.readNum);
        }
        if (StringUtils.isBlank(batchProcessor.getProcessorName())) {
            batchProcessor.setProcessorName(batchProcessor.getClass().getSimpleName());
        }
    }

}
