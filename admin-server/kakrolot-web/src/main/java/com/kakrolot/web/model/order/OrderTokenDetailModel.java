package com.kakrolot.web.model.order;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

import java.util.Date;

/**
 * @Author caoti
 * @Date 2025/4/20 17:45
 */
@Data
public class OrderTokenDetailModel extends BaseModel {

    private Long userId;

    private Long accountId;

    private Long orderRecordId;

    private String token;

    private Long tbExternalId;

    private String tbShopName;

    private Long tbShopId;

    private String status; // 绑定状态，参考TokenBindStatus枚举

    private String bindTime; // 绑定成功的时间

    private String expireTime; // Token 过期时间

    private String tokenCreateTime;


}
