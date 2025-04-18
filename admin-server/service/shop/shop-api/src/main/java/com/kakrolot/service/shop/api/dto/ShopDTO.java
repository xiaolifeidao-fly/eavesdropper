package com.kakrolot.service.shop.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class ShopDTO extends BaseDTO {

    private String code;

    private String name;

    private Integer sortId;

    private Long shopGroupId;

    private String shopTypeCode;

    private Boolean approveFlag;
}
