package com.kakrolot.web.controller.impl;

import com.kakrolot.service.dashboard.api.DashboardService;
import com.kakrolot.service.dashboard.api.dto.*;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.model.WebResponse;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@Slf4j
public class DashboardController extends BaseController {

    @Autowired
    private DashboardService dashboardService;


    @RequestMapping(value = "/today/orderRecordSummary", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "今日任务汇总情况:任务条数等信息", httpMethod = "GET")
    public WebResponse<OrderRecordSummary> todayOrderRecordSummary() {
        //TODO 根据business_code区分 获取不同
//        return WebResponse.success(dashboardService.getTodayOrderRecordSummary());
        OrderRecordSummary orderRecordSummary = new OrderRecordSummary();
        orderRecordSummary.setTotalNum(0L);
        orderRecordSummary.setTotalLoveNum(0L);
        orderRecordSummary.setTotalFollowNum(0L);
        orderRecordSummary.setDetailList(new ArrayList<>());
        return WebResponse.success(orderRecordSummary);
    }

    @RequestMapping(value = "/today/orderRecordCountSummaryByBusinessType", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "今日任务汇总情况:任务条数-businessType  第一列", httpMethod = "GET")
    public WebResponse<OrderRecordCountSummary> orderRecordCountSummaryByBusinessType(@RequestParam("businessType") String businessType) {
        return WebResponse.success(dashboardService.findOrderRecordCountSummaryByBusinessType(businessType));
    }

    @RequestMapping(value = "/today/orderRecordCountSummaryByBusinessCode", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "今日任务汇总情况:任务条数-businessCode", httpMethod = "GET")
    public WebResponse<List<OrderRecordCountSummary>> orderRecordCountSummaryByBusinessCode(@RequestParam("businessCode") String businessCode) {
        return WebResponse.success(dashboardService.findOrderRecordCountSummaryByBusinessCode(businessCode));
    }

    @RequestMapping(value = "/today/orderRecordNumSummaryByBusinessType", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "今日任务汇总情况:任务具体数量等信息-businessType", httpMethod = "GET")
    public WebResponse<List<OrderRecordNumSummary>> todayOrderRecordNumSummaryByBusinessType(@RequestParam("businessType") String businessType) {
        return WebResponse.success(dashboardService.findOrderRecordNumSummaryByBusinessType(businessType));
    }

    @RequestMapping(value = "/today/orderRecordNumSummaryByBusinessCode", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "今日任务汇总情况:任务具体数量等信息-businessCode", httpMethod = "GET")
    public WebResponse<List<OrderRecordNumSummary>> todayOrderRecordNumSummaryByBusinessCode(@RequestParam("businessCode") String businessCode) {
        return WebResponse.success(dashboardService.findOrderRecordNumSummaryByBusinessCode(businessCode));
    }

    @RequestMapping(value = "/today/userTaskSummary", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "今日人工完成量", httpMethod = "GET")
    public WebResponse<UserTaskSummary> todayUserTaskSummary() {
//        return WebResponse.success(dashboardService.getTodayUserTaskSummary());
        UserTaskSummary userTaskSummary = new UserTaskSummary();
        userTaskSummary.setCount(0L);
        userTaskSummary.setDetailList(new ArrayList<>());
        return WebResponse.success(userTaskSummary);
    }

    @RequestMapping(value = "/today/userTaskSummaryByBusinessType", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "今日人工完成量-BusinessType  第二列", httpMethod = "GET")
    public WebResponse<UserTaskSummary> todayUserTaskSummaryByBusinessType(@RequestParam("businessType") String businessType) {
        return WebResponse.success(dashboardService.getTodayUserTaskSummaryByBusinessType(businessType));
    }

    @RequestMapping(value = "/today/userTaskSummaryByBusinessCode", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "今日人工完成量-BusinessCode", httpMethod = "GET")
    public WebResponse<UserTaskSummary> todayUserTaskSummaryByBusinessCode(@RequestParam("businessCode") String businessCode) {
        return WebResponse.success(dashboardService.getTodayUserTaskSummaryByBusinessCode(businessCode));
    }

    @RequestMapping(value = "/today/actualTaskSummaryByBusinessType", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "今日实际完成量-businessType 第三列", httpMethod = "GET")
    public WebResponse<ActualDoneSummary> todayActualTaskSummaryByBusinessType(@RequestParam("businessType") String businessType) {
        return WebResponse.success(dashboardService.getTodayActualDoneSummaryV2ByBusinessType(businessType));
    }

    @RequestMapping(value = "/today/actualTaskSummaryByBusinessCode", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "今日实际完成量-businessCode", httpMethod = "GET")
    public WebResponse<ActualDoneSummary> todayActualTaskSummaryByBusinessCode(@RequestParam("businessCode") String businessCode) {
        return WebResponse.success(dashboardService.getTodayActualDoneSummaryV2ByBusinessCode(businessCode));
    }

    @RequestMapping(value = "/today/remainTaskSummaryByBusinessType", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "剩余完成量,昨日未跑量-businessType 第四列", httpMethod = "GET")
    public WebResponse<List<OrderRecordNumSummary>> todayRemainTaskSummaryByBusinessType(@RequestParam("businessType") String businessType) {
        return WebResponse.success(dashboardService.getRemainTaskSummaryByBusinessType(businessType));
    }

    @RequestMapping(value = "/today/remainTaskSummaryByBusinessCode", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "剩余完成量,昨日未跑量-businessCode", httpMethod = "GET")
    public WebResponse<List<OrderRecordNumSummary>> todayRemainTaskSummaryByBusinessCode(@RequestParam("businessCode") String businessCode) {
        return WebResponse.success(dashboardService.getRemainTaskSummaryByBusinessCode(businessCode));
    }

    @RequestMapping(value = "/today/remainTotalTaskSummary", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "剩余总未跑量", httpMethod = "GET")
    public WebResponse<RemainTaskSummary> todayRemainTotalTaskSummary() {
        return WebResponse.success(dashboardService.getRemainTotalTaskSummary());
    }

    @RequestMapping(value = "/today/consumeSummary", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "今日消费情况", httpMethod = "GET")
    public WebResponse<ConsumeSummary> todayConsumeSummary() {
        try {
            return WebResponse.success(dashboardService.getTodayConsumeSummary());
        } catch (Exception e) {
            ConsumeSummary consumeSummary = new ConsumeSummary();
            consumeSummary.setAmount(0.0);
            return WebResponse.success(consumeSummary);
        }
    }

    @RequestMapping(value = "/today/rechargeSummary", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "今日充值情况", httpMethod = "GET")
    public WebResponse<RechargeSummary> todayRechargeSummary() {
        return WebResponse.success(dashboardService.getTodayRechargeSummary());
    }

    @RequestMapping(value = "/today/userAccountSummary", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "所有用户账户情况,今日余额", httpMethod = "GET")
    public WebResponse<UserAccountSummary> todayUserAccountSummary() {
        return WebResponse.success(dashboardService.getTodayUserAccountSummary());
    }

    @RequestMapping(value = "/history/orderRecordSummary", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "历史任务汇总情况", httpMethod = "GET")
    public WebResponse<OrderRecordSummary> historyOrderRecordSummary(@RequestParam("startTime") String startTime,
                                                                     @RequestParam("endTime") String endTime) {
//        return WebResponse.success(dashboardService.getHistoryOrderRecordSummary(startTime,endTime));
        return WebResponse.success(new OrderRecordSummary());
    }

    @RequestMapping(value = "/history/userTaskSummary", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "历史人工完成量", httpMethod = "GET")
    public WebResponse<UserTaskSummary> historyUserTaskSummary(@RequestParam("startTime") String startTime,
                                                               @RequestParam("endTime") String endTime) {
        return WebResponse.success(dashboardService.getHistoryUserTaskSummary(startTime,endTime));
    }

    @RequestMapping(value = "/history/actualTaskSummary", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "历史实际完成量", httpMethod = "GET")
    public WebResponse<ActualDoneSummary> historyActualTaskSummary(@RequestParam("startTime") String startTime,
                                                                   @RequestParam("endTime") String endTime) {
        return WebResponse.success(dashboardService.getHistoryActualDoneSummary(startTime,endTime));
    }

    @RequestMapping(value = "/history/consumeSummary", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "历史消费情况", httpMethod = "GET")
    public WebResponse<ConsumeSummary> historyConsumeSummary(@RequestParam("startTime") String startTime,
                                                             @RequestParam("endTime") String endTime) {
        return WebResponse.success(dashboardService.getHistoryConsumeSummary(startTime,endTime));
    }

    @RequestMapping(value = "/config", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "DashBoard配置", httpMethod = "GET")
    public WebResponse<List<DashBoardConfigDTO>> dashBoardConfig() {
        return WebResponse.success(dashboardService.getDashBoardConfigList());
    }


}
