package com.kakrolot.service.shop.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.util.List;

/**
 * Created by caoti on 2021/7/21.
 */
@Data
public class ManualShopCategoryDTO extends BaseDTO {

    private Long shopGroupId;

    private String name;

    private String code;

    private Long score;

    private String status;

    private List<ManualShopTypeDTO> shopTypeModelList;

}
