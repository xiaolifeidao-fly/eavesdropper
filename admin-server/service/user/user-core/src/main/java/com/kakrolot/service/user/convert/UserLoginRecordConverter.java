package com.kakrolot.service.user.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.service.user.api.dto.UserLoginRecordDTO;
import com.kakrolot.service.user.dao.po.User;
import com.kakrolot.service.user.dao.po.UserLoginRecord;
import org.springframework.stereotype.Component;

@Component
public class UserLoginRecordConverter extends CommonConvert<UserLoginRecordDTO, UserLoginRecord> {

}
