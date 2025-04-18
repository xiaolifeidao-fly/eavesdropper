package com.kakrolot.service.approve.api;

import com.kakrolot.service.approve.api.dto.UserApproveStatus;
import com.kakrolot.service.approve.api.dto.UserApproveTaskDTO;

import java.util.List;

public interface UserTaskApproveService {


    Long countUserApproveTasksByOrderId(Long orderId, List<UserApproveStatus> userApproveStatuses);

    /**
     * 根据订单ID分页查询审核明细
     *
     * @param orderId
     * @param startIndex
     * @param pageSize
     * @return
     */
    List<UserApproveTaskDTO> findUserApproveTasksByOrderId(Long orderId, List<UserApproveStatus> userApproveStatuses, int startIndex, int pageSize);

    /**
     * 单个审核
     *
     * @param userTaskId
     * @param userApproveStatus
     * @return
     */
    boolean approve(Long userTaskId, UserApproveStatus userApproveStatus);

    /**
     * 批量审核
     *
     * @param userTaskIds
     * @param userApproveStatus
     * @return
     */
    boolean approve(List<Long> userTaskIds, UserApproveStatus userApproveStatus);
}
