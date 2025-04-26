package com.kakrolot.service.order.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.util.Date;

@Data
@Entity
@Table(name = "order_token_detail")
public class OrderTokenDetail extends BasePO {

    private Long userId;
    
    private Long accountId;
    
    private Long orderRecordId;
    
    private String token;
    
    private Long tbExternalId;
    
    private String tbShopName;
    
    private Long tbShopId;
    
    private String status; // 绑定状态，参考TokenBindStatus枚举
    
    private Date bindTime; // 绑定成功的时间
    
    private Date expireTime; // Token 过期时间
}
