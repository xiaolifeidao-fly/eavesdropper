package com.kakrolot.web.model.mock;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

import java.math.BigDecimal;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockTenantShopModel extends BaseModel {

    //租户
    private String tenant;

    //上限
    private Integer upperLimit;

    //下限
    private Integer lowerLimit;

    //密钥
    private String secretKey;

    //价格
    private BigDecimal price;

    //状态
    private String status;

}
