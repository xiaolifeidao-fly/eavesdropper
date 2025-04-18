package com.kakrolot.web.model.userPoint;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

/**
 * Created by caoti on 2021/8/5.
 */
@Data
public class UserPointsWithdrawRecordModel extends BaseModel {

    private String channel;

    private String username;

    private Long points;

    private String status;

    private String description;

    private String applyTime;

    private String approveTime;

    private String alipayName;

    private String alipayAccount;

}
