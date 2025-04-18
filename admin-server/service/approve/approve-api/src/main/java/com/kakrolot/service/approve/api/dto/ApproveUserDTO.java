package com.kakrolot.service.approve.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class ApproveUserDTO extends BaseDTO {

    private Long userId;

    private Long unApproveNum;

    private String status;
}
