package com.kakrolot.service.approve.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class UserApproveTaskDTO extends BaseDTO {

    private String imageUrl;

    private String userTaskId;

    private String status;

    private Long orderId;

}
