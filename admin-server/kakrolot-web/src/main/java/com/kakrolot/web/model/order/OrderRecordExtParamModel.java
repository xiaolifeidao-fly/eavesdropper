package com.kakrolot.web.model.order;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class OrderRecordExtParamModel extends BaseDTO {

    private Long orderRecordId;

    private Long shopExtParamId;

    private String value;

}
