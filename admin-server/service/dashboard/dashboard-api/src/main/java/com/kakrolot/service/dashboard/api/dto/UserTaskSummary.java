package com.kakrolot.service.dashboard.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.util.List;

/**
 * Created by roc_peng on 2020/5/14.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Data
public class UserTaskSummary extends BaseDTO {

    /**
     * 实际完成的任务总量
     */
    private Long count;

    private List<UserTaskSummaryDetail> detailList;

    @Data
    public static class UserTaskSummaryDetail{
        private String taskName;
        private String status;
        private Long count;
    }

}
