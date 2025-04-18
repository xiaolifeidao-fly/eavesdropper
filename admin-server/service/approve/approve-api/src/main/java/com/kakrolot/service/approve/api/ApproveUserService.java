package com.kakrolot.service.approve.api;

import com.kakrolot.service.approve.api.dto.ApproveUserDTO;
import org.springframework.transaction.annotation.Transactional;

public interface ApproveUserService {

    void save(ApproveUserDTO approveUserDTO);

    @Transactional
    void deleteByUserId(Long userId);

    Long findMinApproveUser(Long num);

    ApproveUserDTO findByUserId(Long userId);
}
