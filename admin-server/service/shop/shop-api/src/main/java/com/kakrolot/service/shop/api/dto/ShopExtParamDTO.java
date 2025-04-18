package com.kakrolot.service.shop.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class ShopExtParamDTO extends BaseDTO {

    private String name;

    private String code;

    private Long shopId;

    private String type;

    private String processor;

    private String candidateValue;

}
