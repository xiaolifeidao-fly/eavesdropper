package com.kakrolot.service.approve.api.dto;

import com.kakrolot.common.dto.QueryDTO;
import lombok.Data;

@Data
public class QueryAssignmentConditionDTO extends QueryDTO {

    private String url;

    private Long totalNum;

    private Long factNum;

    private Long userId;

    private Long shopId;

    private Long orderId;

    private String orderHash;

    private String approveStatus;

    private String orderStatus;

}
