package com.kakrolot.service.check.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.*;

/**
 * 任务种类
 */
@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCategoryDTO extends BaseDTO {

    private Long shopId;

    private String code;

    private String name;

    /**
     * 审核方式:粗审 or 细审
     */
    private String approveType;


}
