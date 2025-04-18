package com.kakrolot.service.dashboard.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.util.List;

/**
 * Created by roc_peng on 2020/5/14.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Data
public class UserAccountSummary extends BaseDTO {

    /**
     * 总剩余金额
     */
    private Double amount;

    private List<UserAccountSummaryDetail> detailList;

    @Data
    public static class UserAccountSummaryDetail{
        private String username;
        private String remark;
        //账户金额
        private Double accountAmount = 0.00;
    }

}
