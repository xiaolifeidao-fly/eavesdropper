package com.kakrolot.service.dashboard.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.*;

/**
 * Created by roc_peng on 2020/5/14.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 * 订单总量汇总
 */
@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRecordNumSummary extends BaseDTO {

    /**
     * 进行中的任务总量
     */
    private String name;

    /**
     * 总量
     */
    private Long totalNum;

}
