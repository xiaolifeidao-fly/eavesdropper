package com.kakrolot.web.model.tenant;

import com.kakrolot.web.model.BaseModel;
import com.kakrolot.web.model.shop.ShopCategoryModel;
import com.kakrolot.web.model.shop.ShopModel;
import lombok.Data;

import java.util.List;

@Data
public class TenantModel extends BaseModel {

    private String code;

    private String name;

    private List<ShopCategoryModel> tenantShopCategoryList;
}
