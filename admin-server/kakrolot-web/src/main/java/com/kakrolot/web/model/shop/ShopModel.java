package com.kakrolot.web.model.shop;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

@Data
public class ShopModel extends BaseModel {

    private String name;

    private String code;

    private Integer sortId;

    private Long shopGroupId;

}
