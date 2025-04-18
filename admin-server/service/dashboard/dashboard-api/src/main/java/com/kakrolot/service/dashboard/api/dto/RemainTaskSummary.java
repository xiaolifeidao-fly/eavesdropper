package com.kakrolot.service.dashboard.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.util.List;

/**
 * Created by roc_peng on 2020/5/14.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 * 剩余未跑的量
 */
@Data
public class RemainTaskSummary extends BaseDTO {

    /**
     * 剩余未跑的任务总量
     */
    private Long totalNum;

    /**
     * 每家的任务情况明细
     */
    private List<RemainTaskDetail> detailList;

    @Data
    public static class RemainTaskDetail{
        private String tenantName;
        private String shopName;
        private Long count;
    }

}
