package com.kakrolot.order.consumer.handler.asign;

import com.kakrolot.service.approve.api.ApproveUserService;
import com.kakrolot.service.approve.api.AssignmentService;
import com.kakrolot.service.approve.api.dto.ApproveStatus;
import com.kakrolot.service.approve.api.dto.AssignmentDTO;
import com.kakrolot.service.shop.api.ShopService;
import com.kakrolot.service.shop.api.dto.ShopDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AssignHandler {

    @Autowired
    private ApproveUserService approveUserService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private ShopService shopService;

    public void assign(Long orderId, Long shopId, Long num) {
        try {
            ShopDTO shopDTO = shopService.findById(shopId);
            if (shopDTO == null) {
                return;
            }
            Boolean approveFlag = shopDTO.getApproveFlag();
            if (approveFlag == null || !approveFlag) {
                return;
            }
            Long userId = approveUserService.findMinApproveUser(num);
            if (userId == null) {
                return;
            }
            Long count = assignmentService.countByOrderIdAndUserId(orderId, userId);
            if (count > 0) {
                return;
            }
            AssignmentDTO assignmentDTO = buildAssignmentDTO(orderId, userId, num);
            assignmentService.save(assignmentDTO);
            log.info("assign success orderId {} and userId :{}", orderId, userId);
        } catch (Exception e) {
            log.error("assign error:", e);
        }
    }

    private AssignmentDTO buildAssignmentDTO(Long orderId, Long userId, Long num) {
        AssignmentDTO assignmentDTO = new AssignmentDTO();
        assignmentDTO.setOrderId(orderId);
        assignmentDTO.setUserId(userId);
        assignmentDTO.setApproveStatus(ApproveStatus.CHECKING.name());
        return assignmentDTO;
    }
}
