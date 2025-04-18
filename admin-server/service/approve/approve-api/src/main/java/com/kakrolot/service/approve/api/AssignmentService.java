package com.kakrolot.service.approve.api;

import com.kakrolot.service.approve.api.dto.AssignmentDTO;
import com.kakrolot.service.approve.api.dto.QueryAssignmentConditionDTO;

import java.util.List;

public interface AssignmentService {

    void save(AssignmentDTO assignmentDTO);

    /**
     * 通过条件查询需审批任务总数量
     *
     * @param queryAssignmentConditionDTO
     * @return
     */
    Long countByCondition(QueryAssignmentConditionDTO queryAssignmentConditionDTO);

    /**
     * 通过条件分页查询需审批任务
     *
     * @param queryAssignmentConditionDTO
     * @return
     */
    List<QueryAssignmentConditionDTO> queryByCondition(QueryAssignmentConditionDTO queryAssignmentConditionDTO);

    Long countByOrderIdAndUserId(Long orderId, Long userId);

    AssignmentDTO findById(Long assignmentId);
}
