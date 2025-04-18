package com.kakrolot.service.user.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class UserRoleDTO extends BaseDTO {

    private Long userId;

    private Long roleId;
}
