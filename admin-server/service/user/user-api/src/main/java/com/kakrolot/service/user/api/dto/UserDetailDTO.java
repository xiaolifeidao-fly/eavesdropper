package com.kakrolot.service.user.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

/**
 * Created by caoti on 2021/8/5.
 */
@Data
public class UserDetailDTO extends BaseDTO {

    private String username;

    private String password;

    private String channel;

    private String inventCode;

    private String alipayName;

    private String alipayAccount;

}
