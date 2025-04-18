package com.kakrolot.service.user.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class UserWithdrawRequestDTO extends BaseDTO {

    private String username;

    private Long userPointWithdrawRecordId;

    private String description;

}
