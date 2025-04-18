package com.kakrolot.service.user;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.common.dto.PageDTO;
import com.kakrolot.common.utils.DateUtils;
import com.kakrolot.service.user.api.UserPointService;
import com.kakrolot.service.user.api.dto.UserPointsWithdrawRecordDTO;
import com.kakrolot.service.user.api.dto.UserPointsWithdrawSummaryDTO;
import com.kakrolot.service.user.api.dto.UserWithdrawRequestDTO;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by caoti on 2021/8/5.
 */
@Service
@Slf4j
public class UserPointServiceImpl implements UserPointService {

    @Value("${barry.url.inner.prefix:http://127.0.0.1:9999}")
    private String barryInnerPrefix;

    @Value("${barry.url.inner.point.withdraw.record.suffix:/point/withdrawRecord?channel={channel}&startTime={startTime}&endTime={endTime}}")
    private String withdrawRecordSuffix;

    @Value("${barry.url.inner.point.withdraw.summary.suffix:/point/withdrawSummary?channel={channel}&startTime={startTime}&endTime={endTime}}")
    private String withdrawSummarySuffix;

    @Value("${barry.url.inner.point.withdraw.summary.account.suffix:/point/withdrawSummary/account?channel={channel}&startTime={startTime}&endTime={endTime}}")
    private String withdrawSummaryAccountSuffix;

    @Value("${barry.url.inner.point.withdraw.summary.finish.suffix:/point/withdrawSummary/account?channel={channel}&startTime={startTime}&endTime={endTime}}")
    private String withdrawSummaryFinishSuffix;

    @Value("${barry.url.inner.point.user.withdraw.record.suffix:/point/user/withdrawRecord?username={username}}")
    private String userWithdrawRecordSuffix;

    @Value("${barry.url.inner.point.user.withdraw.account.suffix:/point/user/withdraw/account}")
    private String userWithdrawAccountSuffix;

    @Value("${barry.url.inner.point.user.withdraw.finish.suffix:/point/user/withdraw/finish}")
    private String userWithdrawFinishSuffix;

    @Value("${barry.url.inner.point.user.withdraw.cancel.suffix:/point/user/withdraw/cancel}")
    private String userWithdrawCancelSuffix;

    @Override
    public List<UserPointsWithdrawRecordDTO> findAllByChannelAndStartTimeAndEndTime(Integer page, Integer limit,
                                                                                    String channel, String status, Date startDate, Date endDate) {
        String url = barryInnerPrefix + withdrawRecordSuffix;
        String pageStr = "";
        String limitStr = "";
        if (page != null) {
            pageStr = String.valueOf(page);
        }
        if (limit != null) {
            limitStr = String.valueOf(limit);
        }
        url = url.replace("{page}", pageStr)
                .replace("{limit}", limitStr)
                .replace("{channel}", channel)
                .replace("{status}", status)
                .replace("{startTime}", DateUtils.formatDate(DateUtils.TimeType.yyyy_MM_ddHHmmSS, startDate))
                .replace("{endTime}", DateUtils.formatDate(DateUtils.TimeType.yyyy_MM_ddHHmmSS, endDate));
        Response response = null;
        List<UserPointsWithdrawRecordDTO> userPointsWithdrawRecordDTOList = new ArrayList<>();
        try {
            response = OkHttpUtils.doGetLongTimeout(url, new JSONObject());
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            String data = jsonObject.getString("data");
            PageDTO<JSONObject> pageDTO = JSONObject.parseObject(data, PageDTO.class);
            List<JSONObject> datas = pageDTO.getData();
            userPointsWithdrawRecordDTOList = datas.stream().map(objData ->
                    JSONObject.parseObject(objData.toJSONString(), UserPointsWithdrawRecordDTO.class)).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("findAllByChannelAndStartTimeAndEndTime-error,e is {}", e.toString());
        }
        return userPointsWithdrawRecordDTOList;
    }

    /**
     * 审核中
     * UN_APPROVE("待审核"),
     * APPROVING("审核中"),
     * <p>
     * 结算中
     * ACCOUNTING("结算中")
     * <p>
     * 提现完成
     * FINISH("提现成功")
     * <p>
     * 提现失败
     * ERROR("提现失败")
     *
     * @param channel   channel
     * @param startTime startTime
     * @param endTime   endTime
     * @return
     */
    @Override
    public List<UserPointsWithdrawSummaryDTO> findSummaryByChannelAndStartTimeAndEndTime(String channel, Date startTime, Date endTime) {
        String url = barryInnerPrefix + withdrawSummarySuffix;
        url = url.replace("{channel}", channel)
                .replace("{startTime}", DateUtils.formatDate(DateUtils.TimeType.yyyy_MM_ddHHmmSS, startTime))
                .replace("{endTime}", DateUtils.formatDate(DateUtils.TimeType.yyyy_MM_ddHHmmSS, endTime));
        Response response = null;
        List<UserPointsWithdrawSummaryDTO> userPointsWithdrawSummaryDTOList = new ArrayList<>();
        try {
            response = OkHttpUtils.doGetLongTimeout(url, new JSONObject());
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            String data = jsonObject.getString("data");
            userPointsWithdrawSummaryDTOList = JSONObject.parseArray(data, UserPointsWithdrawSummaryDTO.class);
        } catch (Exception e) {
            log.error("findSummaryByChannelAndStartTimeAndEndTime-error,e is {}", e.toString());
        }
        return userPointsWithdrawSummaryDTOList;
    }


    @Override
    public List<UserPointsWithdrawSummaryDTO> findSummaryByChannelAndStartTimeAndEndTimeGroupByDate(String channel, Date startTime, Date endTime) {
        List<UserPointsWithdrawSummaryDTO> userPointsWithdrawSummaryDTOList = new ArrayList<>();
        Long differDays = DateUtils.getDifferDays(startTime, endTime);
        startTime = DateUtils.clearHMS(startTime);
        startTime = DateUtils.addDate(startTime, -1);
        for (long i = 0; i < differDays; i++) {
            startTime = DateUtils.addDate(startTime, 1);
            endTime = DateUtils.addDate(startTime, 1);
            List<UserPointsWithdrawSummaryDTO> summaryByChannelAndStartTimeAndEndTime = findSummaryByChannelAndStartTimeAndEndTime(channel, startTime, endTime);
            if (CollectionUtils.isNotEmpty(summaryByChannelAndStartTimeAndEndTime)) {
                userPointsWithdrawSummaryDTOList.addAll(summaryByChannelAndStartTimeAndEndTime);
            }
        }
        return userPointsWithdrawSummaryDTOList;
    }

    @Override
    public void withdrawSummaryAccount(String channel, Date startTime, Date endTime) {
        String url = barryInnerPrefix + withdrawSummaryAccountSuffix;
        url = url.replace("{channel}", channel)
                .replace("{startTime}", DateUtils.formatDate(DateUtils.TimeType.yyyy_MM_ddHHmmSS, startTime))
                .replace("{endTime}", DateUtils.formatDate(DateUtils.TimeType.yyyy_MM_ddHHmmSS, endTime));
        try {
            OkHttpUtils.doGetLongTimeout(url, new JSONObject());
        } catch (Exception e) {
            log.error("withdrawSummaryAccount-error,e is {}", e.toString());
        }
    }

    @Override
    public void withdrawSummaryFinish(String channel, Date startTime, Date endTime) {
        String url = barryInnerPrefix + withdrawSummaryFinishSuffix;
        url = url.replace("{channel}", channel)
                .replace("{startTime}", DateUtils.formatDate(DateUtils.TimeType.yyyy_MM_ddHHmmSS, startTime))
                .replace("{endTime}", DateUtils.formatDate(DateUtils.TimeType.yyyy_MM_ddHHmmSS, endTime));
        try {
            OkHttpUtils.doGetLongTimeout(url, new JSONObject());
        } catch (Exception e) {
            log.error("withdrawSummaryFinish-error,e is {}", e.toString());
        }
    }

    @Override
    public List<UserPointsWithdrawRecordDTO> findWithdrawRecordByUserName(String username) {
        String url = barryInnerPrefix + userWithdrawRecordSuffix;
        url = url.replace("{username}", username);
        Response response = null;
        List<UserPointsWithdrawRecordDTO> userPointsWithdrawRecordDTOList = new ArrayList<>();
        try {
            response = OkHttpUtils.doGetLongTimeout(url, new JSONObject());
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            String data = jsonObject.getString("data");
            userPointsWithdrawRecordDTOList = JSONObject.parseArray(data, UserPointsWithdrawRecordDTO.class);
        } catch (Exception e) {
            log.error("findWithdrawRecordByUserName-error,e is {}", e.toString());
        }
        return userPointsWithdrawRecordDTOList;
    }

    @Override
    public void userWithdrawAccount(UserWithdrawRequestDTO userWithdrawRequestDTO) {
        String url = barryInnerPrefix + userWithdrawAccountSuffix;
        try {
            OkHttpUtils.doPost(url, (JSONObject) JSONObject.toJSON(userWithdrawRequestDTO), "application/json", null);
        } catch (Exception e) {
            log.error("userWithdrawAccount-error,e is {}", e.toString());
        }
    }

    @Override
    public void userWithdrawFinish(UserWithdrawRequestDTO userWithdrawRequestDTO) {
        String url = barryInnerPrefix + userWithdrawFinishSuffix;
        try {
            OkHttpUtils.doPost(url, (JSONObject) JSONObject.toJSON(userWithdrawRequestDTO), "application/json", null);
        } catch (Exception e) {
            log.error("userWithdrawAccount-error,e is {}", e.toString());
        }
    }

    @Override
    public void userWithdrawCancel(UserWithdrawRequestDTO userWithdrawRequestDTO) {
        String url = barryInnerPrefix + userWithdrawCancelSuffix;
        try {
            OkHttpUtils.doPost(url, (JSONObject) JSONObject.toJSON(userWithdrawRequestDTO), "application/json", null);
        } catch (Exception e) {
            log.error("userWithdrawAccount-error,e is {}", e.toString());
        }
    }
}
