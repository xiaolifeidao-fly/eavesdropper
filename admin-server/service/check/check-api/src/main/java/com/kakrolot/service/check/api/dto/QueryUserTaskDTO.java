package com.kakrolot.service.check.api.dto;

import com.kakrolot.common.dto.QueryDTO;
import lombok.*;

/**
 * 用户的任务详情 user_task
 */
@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueryUserTaskDTO extends QueryDTO {

    /**
     * blade平台的任务id task_instance_id
     */
    private Long orderId;

    /**
     * 状态 : PENGING  WAITING  DONE ERROR EXPIRE
     */
    private String status;

    /**
     * 状态中文
     */
    private String statusShow;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户渠道
     */
    private String userSource;

}
