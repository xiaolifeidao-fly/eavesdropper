package com.kakrolot.service.user.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Created by caoti on 2021/8/5.
 */
@Data
public class ChannelDetailDTO extends BaseDTO {

    private String code;

    private String name;

    /**
     * MERCHANT("工作室"),
     * RETAILER("散户");
     */
    private String type;

    /**
     * 散户徒弟 积分比例
     */
    private BigDecimal retailerCommissionScale;

    /**
     * 工作室积分比例  > 1
     */
    private BigDecimal merchantCommissionScale;

    /**
     * 是否允许获取任务:禁用任务获取
     */
    private Boolean allowAssign;

    /**
     * 获取任务上限
     */
    private Integer assignLimit;

    /**
     * 备注
     */
    private String remark;

}
