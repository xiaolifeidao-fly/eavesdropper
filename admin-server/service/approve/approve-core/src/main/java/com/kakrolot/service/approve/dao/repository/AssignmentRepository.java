package com.kakrolot.service.approve.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.approve.dao.po.ApproveUser;
import com.kakrolot.service.approve.dao.po.Assignment;

public interface AssignmentRepository extends CommonRepository<Assignment, Long> {

    Long countByOrderIdAndUserId(Long orderId, Long userId);

    Assignment getById(Long assignmentId);
}
