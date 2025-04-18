package com.kakrolot.web.model.tenant;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;
import lombok.NonNull;

import java.util.List;

@Data
public class TenantShopModel extends BaseModel {

    @NonNull
    private List<Long> shopIds;

}
