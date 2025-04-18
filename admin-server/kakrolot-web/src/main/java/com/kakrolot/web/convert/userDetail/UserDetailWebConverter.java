package com.kakrolot.web.convert.userDetail;

import com.kakrolot.service.user.api.dto.ChannelDetailDTO;
import com.kakrolot.service.user.api.dto.ChannelDetailType;
import com.kakrolot.service.user.api.dto.UserDetailDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.userChannel.ChannelDetailModel;
import com.kakrolot.web.model.userDetail.UserDetailModel;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserDetailWebConverter extends WebConvert<UserDetailDTO, UserDetailModel> {

}
