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
public class QueryUserTaskModel extends BaseModel {

    /**
     * blade平台的任务id task_instance_id
     */
    private Long orderId;

    /**
     * 订单对应的hash值
     */
    private String orderHash;

    /**
     * xhs低价关注作品id
     */
    private String xhsLowFollowId;

    /**
     * xhs收藏作品id
     */
    private String xhsCollectId;

    /**
     * xhs点赞作品id
     */
    private String xhsLoveId;

    /**
     * 视频号关注
     */
    private String vxFollowId;

    /**
     * 视频号收藏
     */
    private String vxCollectId;

    /**
     * 视频号点赞
     */
    private String vxLoveId;

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
