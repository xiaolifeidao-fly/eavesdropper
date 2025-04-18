package com.kakrolot.web.controller.impl;

import com.alibaba.excel.EasyExcel;
import com.kakrolot.common.utils.DateUtils;
import com.kakrolot.service.user.api.UserChannelService;
import com.kakrolot.service.user.api.UserPointService;
import com.kakrolot.service.user.api.dto.*;
import com.kakrolot.web.auth.annotations.Auth;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.userPoint.ChannelWebConverter;
import com.kakrolot.web.convert.userPoint.UserPointsWithdrawRecordWebConverter;
import com.kakrolot.web.convert.userPoint.UserPointsWithdrawSummaryWebConverter;
import com.kakrolot.web.convert.userPoint.UserWithdrawRequestWebConverter;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.userPoint.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.net.URLEncoder;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/point")
@Slf4j
public class UserPointController extends BaseController {

    @Autowired
    private UserChannelService userChannelService;

    @Autowired
    private UserPointService userPointService;

    @Autowired
    private ChannelWebConverter channelWebConverter;

    @Autowired
    private UserPointsWithdrawRecordWebConverter userPointsWithdrawRecordWebConverter;

    @Autowired
    private UserPointsWithdrawSummaryWebConverter userPointsWithdrawSummaryWebConverter;

    @Autowired
    private UserWithdrawRequestWebConverter userWithdrawRequestWebConverter;

    //channel渠道相关
    @RequestMapping(value = "/channel", method = RequestMethod.GET)
    @ResponseBody
    public WebResponse<List<ChannelModel>> withdrawRecord() {
        List<ChannelDTO> channelDTOList = userChannelService.getAll();
        List<ChannelModel> channelModelList = channelWebConverter.toModels(channelDTOList);
        return WebResponse.success(channelModelList);
    }

    //积分提现记录
    @RequestMapping(value = "/withdrawRecord", method = RequestMethod.GET)
    @ResponseBody
    public WebResponse<List<UserPointsWithdrawRecordModel>> withdrawRecord(@RequestParam("page") Integer page,
                                                                           @RequestParam("limit") Integer limit,
                                                                           @RequestParam("channel") String channel,
                                                                           @RequestParam("status") String status,
                                                                           @RequestParam("startTime") String startTime,
                                                                           @RequestParam("endTime") String endTime) {
        if (StringUtils.isBlank(channel) || StringUtils.isBlank(startTime) || StringUtils.isBlank(endTime)) {
            return WebResponse.success(Collections.emptyList());
        }
        Date startDate = DateUtils.parseDate(startTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        Date endDate = DateUtils.parseDate(endTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        List<UserPointsWithdrawRecordDTO> withdrawRecordDTOList = userPointService.findAllByChannelAndStartTimeAndEndTime(page, limit, channel, status, startDate, endDate);
        List<UserPointsWithdrawRecordModel> withdrawRecordModelList = userPointsWithdrawRecordWebConverter.toModels(withdrawRecordDTOList);
        return WebResponse.success(withdrawRecordModelList);
    }

    //积分提现汇总
    @RequestMapping(value = "/withdrawSummary", method = RequestMethod.GET)
    @ResponseBody
    public WebResponse<List<UserPointsWithdrawSummaryModel>> withdrawSummary(@RequestParam("channel") String channel,
                                                                             @RequestParam("startTime") String startTime,
                                                                             @RequestParam("endTime") String endTime) {
        if (StringUtils.isBlank(channel) || StringUtils.isBlank(startTime) || StringUtils.isBlank(endTime)) {
            return WebResponse.success(Collections.emptyList());
        }
        Date startDate = DateUtils.parseDate(startTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        Date endDate = DateUtils.parseDate(endTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        List<UserPointsWithdrawSummaryDTO> withdrawSummaryDTOList = userPointService.findSummaryByChannelAndStartTimeAndEndTimeGroupByDate(channel, startDate, endDate);
        List<UserPointsWithdrawSummaryModel> withdrawSummaryModelList = userPointsWithdrawSummaryWebConverter.toModelList(withdrawSummaryDTOList, channel);
        return WebResponse.success(withdrawSummaryModelList);
    }

    //导出结算中数据
    @RequestMapping(value = "/withdrawSummary/export", method = RequestMethod.GET)
    @ResponseBody
    @Auth(isIntercept = false)
    public void withdrawSummaryExport(HttpServletResponse response,
                                      @RequestParam("channel") String channel,
                                      @RequestParam("startTime") String startTime,
                                      @RequestParam("endTime") String endTime) throws Exception {
        if (StringUtils.isBlank(channel) || StringUtils.isBlank(startTime)) {
            return;
        }
        Date startDate = DateUtils.parseDate(startTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        Date endDate = DateUtils.parseDate(endTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        if (startTime.equals(endTime)) {
            endDate = DateUtils.addDate(startDate, 1);
        }
        List<UserPointsWithdrawRecordDTO> withdrawRecordDTOList = userPointService.findAllByChannelAndStartTimeAndEndTime(null, null, channel, WithdrawStatus.ACCOUNTING.name(), startDate, endDate);
        List<UserPointsWithdrawRecordModel> userPointsWithdrawRecordModels = userPointsWithdrawRecordWebConverter.toModels(withdrawRecordDTOList);
        List<UserPointsWithdrawSummaryExportModel> exportModelList = userPointsWithdrawRecordModels.stream().map(userPointsWithdrawRecordModel -> {
            UserPointsWithdrawSummaryExportModel userPointsWithdrawSummaryExportModel = new UserPointsWithdrawSummaryExportModel();
            BeanUtils.copyProperties(userPointsWithdrawRecordModel, userPointsWithdrawSummaryExportModel);
            return userPointsWithdrawSummaryExportModel;
        }).collect(Collectors.toList());
        // 这里注意 有同学反应使用 swagger 会导致各种问题,请直接用浏览器或者用 postman
        response.setContentType("application/vnd.ms-excel");
        response.setCharacterEncoding("utf-8");
        // 这里 URLEncoder.encode 可以防止中文乱码 当然和 easyexcel 没有关系
        String fileName = URLEncoder.encode("今日统计", "UTF-8");
        response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");
        EasyExcel.write(response.getOutputStream(), UserPointsWithdrawSummaryExportModel.class)
                .sheet("模板").doWrite(exportModelList);
    }


    //积分结算
    @RequestMapping(value = "/withdrawSummary/account", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse<String> withdrawSummaryAccount(@RequestBody AccountAndFinishModel accountAndFinishModel) {
        String channel = accountAndFinishModel.getChannel();
        String startTime = accountAndFinishModel.getStartTime();
        String endTime = accountAndFinishModel.getEndTime();
        if (StringUtils.isBlank(channel) || StringUtils.isBlank(startTime)) {
            return WebResponse.error("参数校验错误");
        }
        Date startDate = DateUtils.parseDate(startTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        Date endDate = DateUtils.parseDate(endTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        if (startTime.equals(endTime)) {
            endDate = DateUtils.addDate(startDate, 1);
        }
        userPointService.withdrawSummaryAccount(channel, startDate, endDate);
        return WebResponse.success("发起积分结算成功");
    }

    //积分核销
    @RequestMapping(value = "/withdrawSummary/finish", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse<String> withdrawSummaryFinish(@RequestBody AccountAndFinishModel accountAndFinishModel) {
        String channel = accountAndFinishModel.getChannel();
        String startTime = accountAndFinishModel.getStartTime();
        String endTime = accountAndFinishModel.getEndTime();
        if (StringUtils.isBlank(channel) || StringUtils.isBlank(startTime)) {
            return WebResponse.error("参数校验错误");
        }
        Date startDate = DateUtils.parseDate(startTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        Date endDate = DateUtils.parseDate(endTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        if (startTime.equals(endTime)) {
            endDate = DateUtils.addDate(startDate, 1);
        }
        userPointService.withdrawSummaryFinish(channel, startDate, endDate);
        return WebResponse.success("发起积分核销成功");
    }

    //用户积分提现记录表
    @RequestMapping(value = "/user/withdrawRecord", method = RequestMethod.GET)
    @ResponseBody
    public WebResponse<List<UserPointsWithdrawRecordModel>> userWithdrawRecord(@RequestParam("username") String username) {
        if (StringUtils.isBlank(username)) {
            return WebResponse.success(Collections.emptyList());
        }
        List<UserPointsWithdrawRecordDTO> withdrawRecordDTOList = userPointService.findWithdrawRecordByUserName(username);
        List<UserPointsWithdrawRecordModel> withdrawRecordModelList = userPointsWithdrawRecordWebConverter.toModels(withdrawRecordDTOList);
        return WebResponse.success(withdrawRecordModelList);
    }

    //用户发起积分结算
    @RequestMapping(value = "/user/withdraw/account", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse userWithDrawAccount(@RequestBody UserWithdrawRequestModel userWithdrawRequestModel) {
        if (StringUtils.isBlank(userWithdrawRequestModel.getUsername()) || userWithdrawRequestModel.getUserPointWithdrawRecordId() == null) {
            return WebResponse.error("参数校验错误");
        }
        UserWithdrawRequestDTO userWithdrawRequestDTO = userWithdrawRequestWebConverter.toDTO(userWithdrawRequestModel);
        userPointService.userWithdrawAccount(userWithdrawRequestDTO);
        return WebResponse.success("发起积分结算成功");
    }

    //用户发起积分核销
    @RequestMapping(value = "/user/withdraw/finish", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse userWithDrawFinish(@RequestBody UserWithdrawRequestModel userWithdrawRequestModel) {
        if (StringUtils.isBlank(userWithdrawRequestModel.getUsername()) || userWithdrawRequestModel.getUserPointWithdrawRecordId() == null) {
            return WebResponse.error("参数校验错误");
        }
        UserWithdrawRequestDTO userWithdrawRequestDTO = userWithdrawRequestWebConverter.toDTO(userWithdrawRequestModel);
        userPointService.userWithdrawFinish(userWithdrawRequestDTO);
        return WebResponse.success("发起积分核销成功");
    }

    //用户发起积分取消提现
    @RequestMapping(value = "/user/withdraw/cancel", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse userWithDrawCancel(@RequestBody UserWithdrawRequestModel userWithdrawRequestModel) {
        if (StringUtils.isBlank(userWithdrawRequestModel.getUsername()) || userWithdrawRequestModel.getUserPointWithdrawRecordId() == null
                || StringUtils.isBlank(userWithdrawRequestModel.getDescription())) {
            return WebResponse.error("参数校验错误");
        }
        UserWithdrawRequestDTO userWithdrawRequestDTO = userWithdrawRequestWebConverter.toDTO(userWithdrawRequestModel);
        userPointService.userWithdrawCancel(userWithdrawRequestDTO);
        return WebResponse.success("发起气氛重置成功");
    }

}
