package com.kakrolot.web.convert.userPoint;

import com.kakrolot.service.user.api.dto.UserPointsWithdrawSummaryDTO;
import com.kakrolot.service.user.api.dto.WithdrawStatus;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.userPoint.UserPointsWithdrawSummaryModel;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by caoti on 2021/8/6.
 */
@Component
public class UserPointsWithdrawSummaryWebConverter extends WebConvert<UserPointsWithdrawSummaryDTO, UserPointsWithdrawSummaryModel> {

    public List<UserPointsWithdrawSummaryModel> toModelList(List<UserPointsWithdrawSummaryDTO> userPointsWithdrawSummaryDTOList,String channel) {
        List<UserPointsWithdrawSummaryModel> summaryModelList = new ArrayList<>();
        if (CollectionUtils.isEmpty(userPointsWithdrawSummaryDTOList)) {
            return Collections.emptyList();
        }
        Set<String> dates = userPointsWithdrawSummaryDTOList.stream().map(UserPointsWithdrawSummaryDTO::getDate)
                .sorted(Comparator.naturalOrder()).collect(Collectors.toCollection(LinkedHashSet::new));
        for (String date : dates) {
            List<UserPointsWithdrawSummaryDTO> withdrawSummaryDTOList = userPointsWithdrawSummaryDTOList.stream()
                    .filter(userPointsWithdrawSummaryDTO -> date.equals(userPointsWithdrawSummaryDTO.getDate())).collect(Collectors.toList());
            Long approvingNum = 0L;
            Long approvingPoints = 0L;
            Long accountingNum = 0L;
            Long accountingPoints = 0L;
            Long finishNum = 0L;
            Long finishPoints = 0L;
            Long errorNum = 0L;
            Long errorPoints = 0L;
            List<UserPointsWithdrawSummaryDTO> approvingList = withdrawSummaryDTOList.stream()
                    .filter(userPointsWithdrawSummaryDTO -> WithdrawStatus.APPROVING_LIST.contains(userPointsWithdrawSummaryDTO.getStatus()))
                    .collect(Collectors.toList());
            if(CollectionUtils.isNotEmpty(approvingList)) {
                approvingNum = approvingList.stream().map(UserPointsWithdrawSummaryDTO :: getNumber).reduce(0L,Long::sum);
                approvingPoints = approvingList.stream().map(UserPointsWithdrawSummaryDTO :: getPoints).reduce(0L,Long::sum);
            }

            List<UserPointsWithdrawSummaryDTO> accountingList = withdrawSummaryDTOList.stream()
                    .filter(userPointsWithdrawSummaryDTO -> WithdrawStatus.ACCOUNTING_LIST.contains(userPointsWithdrawSummaryDTO.getStatus()))
                    .collect(Collectors.toList());
            if(CollectionUtils.isNotEmpty(accountingList)) {
                accountingNum = accountingList.stream().map(UserPointsWithdrawSummaryDTO :: getNumber).reduce(0L,Long::sum);
                accountingPoints = accountingList.stream().map(UserPointsWithdrawSummaryDTO :: getPoints).reduce(0L,Long::sum);
            }

            List<UserPointsWithdrawSummaryDTO> finishList = withdrawSummaryDTOList.stream()
                    .filter(userPointsWithdrawSummaryDTO -> WithdrawStatus.FINISH_LIST.contains(userPointsWithdrawSummaryDTO.getStatus()))
                    .collect(Collectors.toList());
            if(CollectionUtils.isNotEmpty(finishList)) {
                finishNum = finishList.stream().map(UserPointsWithdrawSummaryDTO :: getNumber).reduce(0L,Long::sum);
                finishPoints = finishList.stream().map(UserPointsWithdrawSummaryDTO :: getPoints).reduce(0L,Long::sum);
            }

            List<UserPointsWithdrawSummaryDTO> errorList = withdrawSummaryDTOList.stream()
                    .filter(userPointsWithdrawSummaryDTO -> WithdrawStatus.ERROR_LIST.contains(userPointsWithdrawSummaryDTO.getStatus()))
                    .collect(Collectors.toList());
            if(CollectionUtils.isNotEmpty(errorList)) {
                errorNum = errorList.stream().map(UserPointsWithdrawSummaryDTO :: getNumber).reduce(0L,Long::sum);
                errorPoints = errorList.stream().map(UserPointsWithdrawSummaryDTO :: getPoints).reduce(0L,Long::sum);
            }


            UserPointsWithdrawSummaryModel userPointsWithdrawSummaryModel = new UserPointsWithdrawSummaryModel();
            userPointsWithdrawSummaryModel.setDate(date);
            userPointsWithdrawSummaryModel.setChannel(channel);
            userPointsWithdrawSummaryModel.setApprovingNum(approvingNum);
            userPointsWithdrawSummaryModel.setApprovingPoints(approvingPoints);
            userPointsWithdrawSummaryModel.setAccountingNum(accountingNum);
            userPointsWithdrawSummaryModel.setAccountingPoints(accountingPoints);
            userPointsWithdrawSummaryModel.setFinishNum(finishNum);
            userPointsWithdrawSummaryModel.setFinishPoints(finishPoints);
            userPointsWithdrawSummaryModel.setErrorNum(errorNum);
            userPointsWithdrawSummaryModel.setErrorPoints(errorPoints);
            summaryModelList.add(userPointsWithdrawSummaryModel);
        }
        return summaryModelList;
    }

}
