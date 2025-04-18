package com.kakrolot.web.model.user;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;
import lombok.NonNull;

import java.util.List;

@Data
public class UserTenantModel extends BaseModel {

    @NonNull
    private List<Long> tenantIds;

}
