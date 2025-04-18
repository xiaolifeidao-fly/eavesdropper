package com.kakrolot.web.model.order;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

@Data
public class OrderAmountDetailModel extends BaseModel {

    private Long orderId;

    private Long orderConsumerAmount;

    private String description;

    private String operateTime;
}

