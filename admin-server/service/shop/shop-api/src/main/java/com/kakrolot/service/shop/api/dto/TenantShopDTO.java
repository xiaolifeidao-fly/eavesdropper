package com.kakrolot.service.shop.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TenantShopDTO extends BaseDTO {

    private Long tenantId;

    private Long shopId;

}
