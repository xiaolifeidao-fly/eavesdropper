package com.kakrolot.service.approve;

import com.kakrolot.service.approve.api.ApproveUserService;
import com.kakrolot.service.approve.api.dto.ApproveUserDTO;
import com.kakrolot.service.approve.converter.ApproveUserConverter;
import com.kakrolot.service.approve.dao.po.ApproveUser;
import com.kakrolot.service.approve.dao.repository.ApproveUserRepository;
import com.kakrolot.service.approve.support.ApproveUserSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApproveUserServiceImpl implements ApproveUserService {

    @Autowired
    private ApproveUserRepository approveUserRepository;

    @Autowired
    private ApproveUserConverter approveUserConverter;

    @Autowired
    private ApproveUserSupport approveUserSupport;

    @Override
    public void save(ApproveUserDTO approveUserDTO) {
        ApproveUser approveUser = approveUserConverter.toPo(approveUserDTO);
        approveUserRepository.save(approveUser);
        approveUserSupport.addUserId(approveUserDTO.getUserId());
    }

    @Override
    @Transactional
    public void deleteByUserId(Long userId) {
        approveUserRepository.deleteByUserId(userId);
        approveUserSupport.removeUserId(userId);
    }

    @Override
    public Long findMinApproveUser(Long num) {
        Long userId = approveUserSupport.choseUserId(num);
        if (userId == null) {
            return null;
        }
        return userId;
    }

    @Override
    public ApproveUserDTO findByUserId(Long userId) {
        ApproveUser approveUser = approveUserRepository.findByUserId(userId);
        return approveUserConverter.toDTO(approveUser);
    }
}
