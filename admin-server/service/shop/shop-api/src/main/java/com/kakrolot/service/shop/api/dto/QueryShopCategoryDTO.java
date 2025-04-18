package com.kakrolot.service.shop.api.dto;

import com.kakrolot.common.dto.QueryDTO;
import lombok.Data;

@Data
public class QueryShopCategoryDTO extends QueryDTO {

    private Long shopId;

    private String status;
}
