package com.kakrolot.service.check.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.*;

import java.util.List;

/**
 * 上传的审核结果
 */
@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTaskCheckDTO extends BaseDTO {

    /**
     * blade平台的任务id task_instance_id
     */
    private List<Long> userTaskIds;

    /**
     * 审核结果:  DONE 成功 ERROR 失败
     */
    private String result;

}
