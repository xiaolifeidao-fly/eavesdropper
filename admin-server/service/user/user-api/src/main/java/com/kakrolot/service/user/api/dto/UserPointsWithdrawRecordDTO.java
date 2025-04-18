package com.kakrolot.service.user.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

/**
 * Created by caoti on 2021/8/5.
 */
@Data
public class UserPointsWithdrawRecordDTO extends BaseDTO {

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
