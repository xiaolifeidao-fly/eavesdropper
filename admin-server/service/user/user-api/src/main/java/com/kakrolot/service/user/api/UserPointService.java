package com.kakrolot.service.user.api;

import com.kakrolot.service.user.api.dto.UserPointsWithdrawRecordDTO;
import com.kakrolot.service.user.api.dto.UserPointsWithdrawSummaryDTO;
import com.kakrolot.service.user.api.dto.UserWithdrawRequestDTO;

import java.util.Date;
import java.util.List;

public interface UserPointService {

    List<UserPointsWithdrawRecordDTO> findAllByChannelAndStartTimeAndEndTime(Integer page, Integer limit,
                                                                             String channel, String status, Date startDate, Date endDate);

    List<UserPointsWithdrawSummaryDTO> findSummaryByChannelAndStartTimeAndEndTime(String channel, Date startTime, Date endTime);

    List<UserPointsWithdrawSummaryDTO> findSummaryByChannelAndStartTimeAndEndTimeGroupByDate(String channel, Date startTime, Date endTime);

    void withdrawSummaryAccount(String channel, Date startTime, Date endTime);

    void withdrawSummaryFinish(String channel, Date startTime, Date endTime);

    List<UserPointsWithdrawRecordDTO> findWithdrawRecordByUserName(String username);

    void userWithdrawAccount(UserWithdrawRequestDTO userWithdrawRequestDTO);

    void userWithdrawFinish(UserWithdrawRequestDTO userWithdrawRequestDTO);

    void userWithdrawCancel(UserWithdrawRequestDTO userWithdrawRequestDTO);

}
