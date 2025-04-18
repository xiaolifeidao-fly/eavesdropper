package com.kakrolot.web.model.mock;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

import java.math.BigDecimal;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockOrderModel extends BaseModel {

    //用户
    private String username;

    //订单链接
    private String orderUrl;

    //订单金额
    private BigDecimal orderAmount;

    //初始数量
    private Integer initNum;

    //结束数量
    private Integer endNum;

    //订单状态
    private String status;

}
