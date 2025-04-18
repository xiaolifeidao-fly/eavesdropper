package com.kakrolot.service.shop.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.shop.api.dto.ShopGroupDTO;
import com.kakrolot.service.shop.dao.po.ShopGroup;
import org.springframework.stereotype.Component;

@Component
public class ShopGroupConverter extends CommonConvert<ShopGroupDTO, ShopGroup> {
}
