package com.kakrolot.service.dashboard.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class QueryOrderSummaryDTO extends BaseDTO {

    private String startTime;

    private String endTime;

    private String businessType;

}
