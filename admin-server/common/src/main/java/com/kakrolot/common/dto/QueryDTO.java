package com.kakrolot.common.dto;

import lombok.Data;

@Data
public class QueryDTO extends BaseDTO {

    private int startIndex;

    private int pageSize;
}
