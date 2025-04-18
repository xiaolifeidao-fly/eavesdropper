package com.kakrolot.service.user.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

/**
 * Created by caoti on 2021/8/5.
 */
@Data
public class UserPointsWithdrawSummaryDTO extends BaseDTO {

    private Long number;

    private Long points;

    private String status;

    private String date;

}
