package com.kakrolot.web.model.order;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class ShopGroupModel extends BaseDTO {

    private String businessType;

    private String groupName;

}
