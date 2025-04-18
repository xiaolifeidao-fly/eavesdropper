package com.kakrolot.service.tenant.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.tenant.api.dto.TenantDTO;
import com.kakrolot.service.tenant.dao.po.Tenant;
import org.springframework.stereotype.Component;

@Component
public class TenantConverter extends CommonConvert<TenantDTO, Tenant> {
}
