package com.kakrolot.web.model.userPoint;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

/**
 * Created by caoti on 2021/8/5.
 */
@Data
public class UserPointsWithdrawSummaryModel extends BaseModel {

    private String date;

    private String channel;

    //审核中数量
    private Long approvingNum;

    //审核中积分
    private Long approvingPoints;

    //结算中数量
    private Long accountingNum;

    //结算中积分
    private Long accountingPoints;

    //提现完成数量
    private Long finishNum;

    //提现完成积分
    private Long finishPoints;

    //提现失败数量
    private Long errorNum;

    //提现失败积分
    private Long errorPoints;

}
