package com.kakrolot.web.model.mock;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

import java.math.BigDecimal;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockAccountModel extends BaseModel {

    //用户
    private String username;

    //金额
    private BigDecimal amount;

    //状态
    private String status;

}
