package com.kakrolot.web.model.user;

import com.kakrolot.web.model.BaseModel;
import com.kakrolot.web.model.role.RoleModel;
import com.kakrolot.web.model.tenant.TenantModel;
import io.swagger.annotations.ApiParam;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class QueryUserModel extends BaseModel {

    @ApiParam("用户名")
    private String username;

    private String originPassword;

    private String secretKey;

    @ApiParam("租户")
    private List<TenantModel> tenantModelList;

    @ApiParam("角色")
    private List<RoleModel>  roleModelList;

    private String accountStatus;

    private BigDecimal balanceAmount;

    private Long accountId;

    private String remark;

}
