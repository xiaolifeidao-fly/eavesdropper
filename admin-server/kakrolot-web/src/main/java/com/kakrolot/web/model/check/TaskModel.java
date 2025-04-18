package com.kakrolot.web.model.check;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

/**
 * 任务
 */
@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskModel extends BaseModel {

    private Long shopId;

    /**
     * 任务类型
     */
    private String code;

    /**
     * 卡卡平台的id  order_record_id
     */
    private Long orderRecordId;

    private String orderHash;

    /**
     * blade平台的任务id task_instance_id
     */
    private Long taskInstanceId;

    /**
     * 类目
     */
    private String shopCategoryName;

    /**
     * 链接
     */
    private String taskContent;

    /**
     * 数量
     */
    private Long orderNum;

    /**
     * 初始数量
     */
    private Long initNum;

    /**
     * 结束数量
     */
    private Long endNum;

    /**
     * 审核中数量
     */
    private Long waitNum;

    /**
     * 上量成功数量
     */
    private Long doneNum;

    /**
     * 上量失败数量
     */
    private Long errorNum;

    /**
     * 订单审核状态
     */
    private String approveStatus;

    /**
     * 订单审核状态中文
     */
    private String approveStatusShow;

    /**
     * 订单状态
     */
    private String orderStatus;

    /**
     * 订单状态中文
     */
    private String orderStatusShow;

    private String createTimeStr;

    private String updateTimeStr;

}
