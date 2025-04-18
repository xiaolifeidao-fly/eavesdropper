package com.kakrolot.service.shop.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "shop_ext_param")
public class ShopExtParam extends BasePO {

    private String name;

    private String code;

    private Long shopId;

    private String type;

    private String processor;

    private String candidateValue;

}
