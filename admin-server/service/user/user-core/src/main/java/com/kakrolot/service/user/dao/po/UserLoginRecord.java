package com.kakrolot.service.user.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "user_login_record")
public class UserLoginRecord extends BasePO {

    private String ip;

    private Long userId;

}
