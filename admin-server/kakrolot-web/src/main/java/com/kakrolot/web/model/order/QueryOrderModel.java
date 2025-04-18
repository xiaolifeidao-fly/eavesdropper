package com.kakrolot.web.model.order;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class QueryOrderModel extends BaseModel {

    private Long tenantId;

    private String tenantName;

    private Long shopId;

    private String shopName;

    private Long shopCategoryId;

    private String shopCategoryName;

    private Long userId;

    private Long orderRecordId;

    private String userName;

    private Long initNum;

    private Long endNum;

    private String orderStatus;

    private String orderStatusShow;

    //单价
    private BigDecimal price;
    // 数量
    private Long orderNum;

    private BigDecimal orderAmount;

    private String businessId;

    private String startTime;

    private String endTime;

    private String tinyUrl;

    private String orderCreateTime;

    private String orderUpdateTime;

    private String orderHash;

    private List<ExtParamModel> extParamModelList;

    @Data
    public class ExtParamModel{
        private Long shopExtParamId;

        private String name;

        private String code;

        private String paramStr;

    }

}


