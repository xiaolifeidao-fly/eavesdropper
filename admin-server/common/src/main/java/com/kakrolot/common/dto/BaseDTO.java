package com.kakrolot.common.dto;


import com.kakrolot.common.utils.Constant;
import lombok.Data;

import java.util.Date;

/**
 *
 * @author xiaofeidao
 * @date 2019/4/1
 */
@Data
public class BaseDTO {

    protected Long id;

    protected Date createTime;

    protected Date updateTime;

    protected String createBy;

    protected String updateBy;

    protected Boolean active = Constant.ACTIVE;

}
