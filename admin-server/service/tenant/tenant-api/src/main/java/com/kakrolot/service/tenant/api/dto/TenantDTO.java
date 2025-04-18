package com.kakrolot.service.tenant.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class TenantDTO extends BaseDTO {

    private String code;

    private String name;
}
