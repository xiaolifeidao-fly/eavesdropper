package com.kakrolot.service.tenant.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class TenantUserDTO extends BaseDTO {

    private Long userId;

    private Long tenantId;
}
