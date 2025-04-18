package com.kakrolot.web.model.userDetail;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

/**
 * Created by caoti on 2021/8/5.
 */
@Data
public class UserDetailModel extends BaseModel {

    private String username;

    private String password;

    private String channel;

    private String inventCode;

    private String alipayName;

    private String alipayAccount;

}
