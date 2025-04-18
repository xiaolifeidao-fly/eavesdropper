package com.kakrolot.service.user.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.util.Date;

@Data
@Entity
@Table(name = "user")
public class User extends BasePO {

    private String username;

    private String password;

    private String originPassword;

    private String status;

    private Date lastLoginTime;

    private String secretKey;

    private String remark;

    private String pubToken;

}
