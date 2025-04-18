package com.kakrolot.service.order.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class OrderRecordExtParamDTO extends BaseDTO {

    private Long orderRecordId;

    private String innerParams;

    private String params;
}
