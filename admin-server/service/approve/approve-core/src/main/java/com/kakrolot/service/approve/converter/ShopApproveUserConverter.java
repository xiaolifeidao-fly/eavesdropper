package com.kakrolot.service.approve.converter;

import com.kakrolot.service.approve.api.dto.ShopApproveUserDTO;
import com.kakrolot.service.approve.dao.po.ShopApproveUser;
import com.kakrolot.service.common.convert.CommonConvert;
import org.springframework.stereotype.Component;

@Component
public class ShopApproveUserConverter extends CommonConvert<ShopApproveUserDTO, ShopApproveUser> {
}
