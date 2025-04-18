package com.kakrolot.service.user.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class RoleDTO extends BaseDTO {

    private String name;

    private String code;
}
