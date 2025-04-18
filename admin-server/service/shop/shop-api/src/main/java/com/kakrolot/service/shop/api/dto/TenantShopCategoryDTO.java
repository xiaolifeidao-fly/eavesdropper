package com.kakrolot.service.shop.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class TenantShopCategoryDTO extends BaseDTO {

    private Long tenantId;

    private Long shopCategoryId;

}
