package com.kakrolot.service.approve.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class AssignmentDTO extends BaseDTO {

    private Long userId;

    private Long orderId;

    private String approveStatus;

    private Long approveNum;

    private Long unApproveNum;


}
