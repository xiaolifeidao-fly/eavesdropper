package com.kakrolot.service.tenant.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.tenant.api.dto.TenantUserDTO;
import com.kakrolot.service.tenant.dao.po.TenantUser;
import org.springframework.stereotype.Component;

@Component
public class TenantUserConverter extends CommonConvert<TenantUserDTO, TenantUser> {
}
