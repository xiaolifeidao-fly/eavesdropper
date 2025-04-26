package com.kakrolot.service.order.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import java.util.Date;

/**
 * 查询激活码明细的结果映射类
 */
@Data
@Entity
public class QueryTokenDetail extends BasePO {
    private Long id;
    private Long orderRecordId;
    private String token;
    private String tbExternalId;
    private String tbShopName;
    private String tbShopId;
    private String status;
    private Date bindTime;
    private Date createTime;
    private Date expireTime;
    private Long userId;
    private Long accountId;
//    private Long tenantId;
}