package com.kakrolot.web.model.order;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

@Data
public class QueryOrderSummaryModel extends BaseModel {

    private String startTime;

    private String endTime;

    private String businessType;

}
