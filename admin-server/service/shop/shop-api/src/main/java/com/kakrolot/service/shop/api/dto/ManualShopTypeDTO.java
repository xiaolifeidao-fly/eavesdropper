package com.kakrolot.service.shop.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

/**
 * Created by caoti on 2021/7/21.
 */
@Data
public class ManualShopTypeDTO extends BaseDTO {

    private String name;

    private String code;

    private Long shopGroupId;

}
