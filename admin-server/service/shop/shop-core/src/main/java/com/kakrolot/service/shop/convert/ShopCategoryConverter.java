package com.kakrolot.service.shop.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.shop.dao.po.ShopCategory;
import com.kakrolot.service.shop.api.dto.ShopCategoryDTO;
import org.springframework.stereotype.Component;

@Component
public class ShopCategoryConverter extends CommonConvert<ShopCategoryDTO, ShopCategory> {
}
