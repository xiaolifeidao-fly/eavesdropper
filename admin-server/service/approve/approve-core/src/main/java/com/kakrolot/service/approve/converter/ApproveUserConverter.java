package com.kakrolot.service.approve.converter;

import com.kakrolot.service.approve.api.dto.ApproveUserDTO;
import com.kakrolot.service.approve.dao.po.ApproveUser;
import com.kakrolot.service.common.convert.CommonConvert;
import org.springframework.stereotype.Component;

@Component
public class ApproveUserConverter extends CommonConvert<ApproveUserDTO, ApproveUser> {
}
