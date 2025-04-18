package com.kakrolot.service.user.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.user.api.dto.RoleDTO;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.service.user.dao.po.Role;
import com.kakrolot.service.user.dao.po.User;
import org.springframework.stereotype.Component;

@Component
public class RoleConverter extends CommonConvert<RoleDTO, Role> {

}
