package com.kakrolot.service.user.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class RoleResourceDTO extends BaseDTO {

    private Long roleId;

    private Long resourceId;

}
