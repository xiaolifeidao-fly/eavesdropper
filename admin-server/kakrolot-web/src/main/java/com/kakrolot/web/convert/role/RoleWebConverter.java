package com.kakrolot.web.convert.role;

import com.kakrolot.service.user.api.dto.RoleDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.role.RoleModel;
import org.springframework.stereotype.Component;

@Component
public class RoleWebConverter extends WebConvert<RoleDTO, RoleModel> {

}
