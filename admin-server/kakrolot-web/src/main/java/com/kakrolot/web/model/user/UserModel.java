package com.kakrolot.web.model.user;

import com.kakrolot.web.model.BaseModel;
import io.swagger.annotations.ApiParam;
import lombok.Data;

@Data
public class UserModel extends BaseModel {

    @ApiParam("用户名")
    private String username;

    @ApiParam("状态")
    private String status;

    @ApiParam("密码")
    private String password;

}
