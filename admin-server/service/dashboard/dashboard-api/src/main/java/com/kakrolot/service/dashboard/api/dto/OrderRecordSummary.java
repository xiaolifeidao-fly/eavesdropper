package com.kakrolot.service.dashboard.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.util.List;

/**
 * Created by roc_peng on 2020/5/14.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Data
public class OrderRecordSummary extends BaseDTO {

    /**
     * 进行中的任务总量
     */
    private Long totalNum;

    /**
     * 进行中的点赞任务总量
     */
    private Long totalLoveNum;

    /**
     * 进行中的关注任务总量
     */
    private Long totalFollowNum;

    /**
     * 直播总数量
     */
    private Long totalLiveNum;

    /**
     * 小红薯关注任务
     */
    private Long totalXhsFollowNum;

    /**
     * 小红薯收藏任务
     */
    private Long totalXhsCollectNum;

    /**
     * 小红薯点赞任务
     */
    private Long totalXhsLoveNum;

    /**
     * 每家的任务情况明细
     */
    private List<OrderRecordDetail> detailList;

    @Data
    public static class OrderRecordDetail{
        private String tenantName;
        private String shopName;
        private String shopCategoryName;
        private Long count;
    }

}
