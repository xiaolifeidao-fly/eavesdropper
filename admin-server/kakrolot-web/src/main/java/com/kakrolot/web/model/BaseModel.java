package com.kakrolot.web.model;

import com.kakrolot.common.utils.Constant;
import lombok.Data;

import java.util.Date;

@Data
public class BaseModel {

    protected Long id;

    protected Date createTime;

    protected Date updateTime;

    protected String createBy;

    protected String updateBy;

    protected Boolean active = Constant.ACTIVE;
}
