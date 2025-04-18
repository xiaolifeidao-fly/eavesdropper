package com.kakrolot.web.model.order;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

import java.util.List;

@Data
public class OrderRecordModel extends BaseModel {

    private Long tenantId;

    private String tenantName;

    private Long shopId;

    private String shopName;

    private Long shopCategoryId;

    private String shopCategoryName;

    private Long userId;

    private String userName;

    private Long initNum;

    private Long endNum;

    private String orderStatus;

    // 数量
    private Long orderNum;

    private Long orderAmount;

    private String businessId;

    private Long factNum;

    //补款数量
    private Long bkNum;

    private Long rgUnApproveNum;
    private Long rgApproveNum;

    private String businessType;

    private String bid;

    private List<OrderRecordExtParamModel> orderRecordExtParamModelList;

}
