package com.kakrolot.service.shop.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.shop.api.dto.ShopDTO;
import com.kakrolot.service.shop.dao.po.Shop;
import org.springframework.stereotype.Component;

@Component
public class ShopConverter extends CommonConvert<ShopDTO, Shop> {
}
