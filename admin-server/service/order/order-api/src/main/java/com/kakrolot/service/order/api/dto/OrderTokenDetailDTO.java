package com.kakrolot.service.order.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.util.Date;

@Data
public class OrderTokenDetailDTO extends BaseDTO {

    private Long userId;
    
    private Long accountId;
    
    private Long orderRecordId;
    
    private String token;
    
    private String tbExternalId;
    
    private String tbShopName;
    
    private String tbShopId;
    
    private String status; // 绑定状态，参考TokenBindStatus枚举
    
    private Date bindTime; // 绑定成功的时间

    private Date expireTime; // Token 过期时间

} 