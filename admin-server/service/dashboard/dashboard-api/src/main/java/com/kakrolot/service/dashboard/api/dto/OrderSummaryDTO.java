package com.kakrolot.service.dashboard.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.*;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderSummaryDTO extends BaseDTO {

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
