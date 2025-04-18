package com.kakrolot.web.model.order;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

@Data
public class OrderSummaryModel extends BaseModel {

    private String name;

    /**
     * 退单订单量
     */
    private Long refundOrders;

    /**
     * 退单完成量
     */
    private Long refundCounts;

    /**
     * 完成订单量
     */
    private Long doneOrders;

    /**
     * 完成订单的完成量
     */
    private Long doneCounts;

    /**
     * 补单订单量
     */
    private Long bkOrders;

    /**
     * 补单订单的完成量
     */
    private Long bkCounts;

}
