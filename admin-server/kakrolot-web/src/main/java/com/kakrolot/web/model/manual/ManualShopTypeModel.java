package com.kakrolot.web.model.manual;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

/**
 * Created by caoti on 2021/7/21.
 */
@Data
public class ManualShopTypeModel extends BaseModel {

    private String name;

    private String code;

    private Long shopGroupId;

}
