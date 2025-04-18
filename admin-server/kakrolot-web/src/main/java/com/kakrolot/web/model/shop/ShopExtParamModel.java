package com.kakrolot.web.model.shop;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

import java.util.List;

@Data
public class ShopExtParamModel extends BaseModel {

    private String name;

    private String code;

    private Long shopId;

    private String type;

    private String processor;

    private Long shopExtParamId;

    private List<candidateValues> candidateValuesList;

    @Data
    public class candidateValues{
        private String key;
        private String value;
    }

}
