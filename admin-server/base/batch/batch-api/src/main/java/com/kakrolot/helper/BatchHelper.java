package com.kakrolot.helper;


import com.kakrolot.BatchSupport;
import org.springframework.beans.factory.annotation.Autowired;

/**
 *
 * @author xiaofeidao
 * @date 2017/11/15
 */
public class BatchHelper {

    @Autowired
    private BatchSupport batchSupport;

    public <I,O> void doBatch(BatchHelperProcessor<I,O> batchHelperProcessor){
        batchSupport.doBatchExecute(batchHelperProcessor);
    }
}
