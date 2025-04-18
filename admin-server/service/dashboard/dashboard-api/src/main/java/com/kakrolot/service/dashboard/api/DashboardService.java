package com.kakrolot.service.dashboard.api;


import com.kakrolot.service.dashboard.api.dto.*;

import java.util.List;

public interface DashboardService {

    /**
     * 获取当前进行中的任务情况
     *
     * @return
     */
    OrderRecordSummary getTodayOrderRecordSummary();

    /**
     * 今日人工完成情况汇总
     *
     * @return
     */
    UserTaskSummary getTodayUserTaskSummaryByBusinessType(String businessType);

    UserTaskSummary getTodayUserTaskSummaryByBusinessCode(String businessCode);

    /**
     * 今日消费情况
     *
     * @return
     */
    ConsumeSummary getTodayConsumeSummary();

    /**
     * 今日充值情况
     *
     * @return
     */
    RechargeSummary getTodayRechargeSummary();

    /**
     * 所有用户账户情况
     *
     * @return
     */
    UserAccountSummary getTodayUserAccountSummary();

    /**
     * 今日实际完成的任务总量
     *
     * @return
     */
    ActualDoneSummary getTodayActualDoneSummary();

    ActualDoneSummary getTodayActualDoneSummaryV2ByBusinessCode(String businessCode);

    ActualDoneSummary getTodayActualDoneSummaryV2ByBusinessType(String businessType);

    /**
     * 昨日未跑量
     *
     * @return
     */
    List<OrderRecordNumSummary> getRemainTaskSummaryByBusinessCode(String businessCode);

    List<OrderRecordNumSummary> getRemainTaskSummaryByBusinessType(String businessType);

    /**
     * 系统总剩余量
     *
     * @return
     */
    RemainTaskSummary getRemainTotalTaskSummary();

    /**
     * 获取历史进行中的任务情况
     *
     * @return
     */
    OrderRecordSummary getHistoryOrderRecordSummary(String startTime, String endTime);

    /**
     * 历史人工完成情况汇总
     *
     * @return
     */
    UserTaskSummary getHistoryUserTaskSummary(String startTime, String endTime);

    /**
     * 历史消费情况
     *
     * @return
     */
    ConsumeSummary getHistoryConsumeSummary(String startTime, String endTime);

    /**
     * 历史实际完成的任务总量
     *
     * @return
     */
    ActualDoneSummary getHistoryActualDoneSummary(String startTime, String endTime);

    /**
     * 根据shopGroup的businessType任务类型获取订单的实际完成量
     *
     * @param queryOrderSummaryDTO
     * @return
     */
    OrderSummaryDTO findBySummaryCondition(QueryOrderSummaryDTO queryOrderSummaryDTO, Long userId);

    /**
     * 根据businessCode获取任务num总量
     *
     * @param businessCode businessCode
     * @return
     */
    List<OrderRecordNumSummary> findOrderRecordNumSummaryByBusinessCode(String businessCode);

    List<OrderRecordNumSummary> findOrderRecordNumSummaryByBusinessType(String businessType);

    /**
     * 根据businessType获取任务条数
     *
     * @param businessType
     * @return
     */
    OrderRecordCountSummary findOrderRecordCountSummaryByBusinessType(String businessType);

    /**
     * 根据businessCode获取任务条数
     *
     * @param businessCode
     * @return
     */
    List<OrderRecordCountSummary> findOrderRecordCountSummaryByBusinessCode(String businessCode);

    /**
     * 获取dashboard的配置
     *
     * @return
     */
    List<DashBoardConfigDTO> getDashBoardConfigList();

}
