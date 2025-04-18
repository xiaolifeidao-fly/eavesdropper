package com.kakrolot.service.user.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.user.api.dto.RoleDTO;
import com.kakrolot.service.user.api.dto.UserRoleDTO;
import com.kakrolot.service.user.dao.po.Role;
import com.kakrolot.service.user.dao.po.UserRole;
import org.springframework.stereotype.Component;

@Component
public class UserRoleConverter extends CommonConvert<UserRoleDTO, UserRole> {

}
