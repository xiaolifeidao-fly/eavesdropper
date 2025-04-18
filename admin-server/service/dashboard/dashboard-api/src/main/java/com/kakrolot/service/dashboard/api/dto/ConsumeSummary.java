package com.kakrolot.service.dashboard.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.util.List;

/**
 * Created by roc_peng on 2020/5/14.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Data
public class ConsumeSummary extends BaseDTO {

    /**
     * 消费总金额
     */
    private Double amount;

    private List<ConsumeSummaryDetail> detailList;

    @Data
    public static class ConsumeSummaryDetail{
        private String username;
        private String remark;
        //消费金额
        private Double consumeAmount;
        //退货金额
        private Double refundAmount;
        //补款金额
        private Double bkAmount;
    }

}
