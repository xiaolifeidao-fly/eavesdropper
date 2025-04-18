package com.kakrolot.web.model.check;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

/**
 * 用户的任务详情 user_task
 */
@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTaskModel extends BaseModel {

    private Long orderId;

    /**
     * blade平台的任务userTaskId
     */
    private String userTaskId;

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

    /**
     * 上传的图片地址
     */
    private String picUrl;

    private String createTimeStr;

    private String updateTimeStr;

}
