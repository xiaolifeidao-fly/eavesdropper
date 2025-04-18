package com.kakrolot.service.approve.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class ShopApproveUserDTO extends BaseDTO {

    private String approveType;

    private Long userId;

    private Long shopId;
}
