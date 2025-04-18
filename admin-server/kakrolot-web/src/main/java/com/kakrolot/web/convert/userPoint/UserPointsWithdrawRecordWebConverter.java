package com.kakrolot.web.convert.userPoint;

import com.kakrolot.service.user.api.dto.UserPointsWithdrawRecordDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.userPoint.UserPointsWithdrawRecordModel;
import org.springframework.stereotype.Component;

/**
 * Created by caoti on 2021/8/6.
 */
@Component
public class UserPointsWithdrawRecordWebConverter extends WebConvert<UserPointsWithdrawRecordDTO, UserPointsWithdrawRecordModel> {
}
