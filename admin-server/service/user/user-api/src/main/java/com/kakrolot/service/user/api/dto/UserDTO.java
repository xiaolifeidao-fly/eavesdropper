package com.kakrolot.service.user.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.util.Date;

@Data
public class UserDTO extends BaseDTO {

    private String username;

    private String password;

    private String originPassword;

    private String status;

    private Date lastLoginTime;

    private String secretKey;

    private String remark;

    private String pubToken;
}
