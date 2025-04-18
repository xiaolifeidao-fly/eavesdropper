package com.kakrolot.service.order.dao.po;

import javax.persistence.Entity;
import javax.persistence.Table;

import com.kakrolot.common.po.BasePO;

import lombok.Data;

@Data
@Entity
@Table(name = "external_yike_goods_mapping")
public class ExternalYikeGoodsMapping extends BasePO {
    
    private String goodsId; // 商品id
    
    private Long shopCategoryId; // 商品类目id
  
}
