package com.kakrolot.web.model.userPoint;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

/**
 * Created by caoti on 2021/8/5.
 */
@Data
public class UserPointsWithdrawSummaryExportModel {

    @ExcelProperty("渠道")
    private String channel;

    @ExcelProperty("账号")
    private String username;

    @ExcelProperty("积分")
    private Long points;

    @ExcelProperty("申请提现时间")
    private String applyTime;

    @ExcelProperty("致富宝姓名")
    private String alipayName;

    @ExcelProperty("致富宝账户")
    private String alipayAccount;

}
