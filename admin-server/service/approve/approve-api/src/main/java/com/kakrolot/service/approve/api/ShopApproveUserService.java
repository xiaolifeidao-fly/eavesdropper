package com.kakrolot.service.approve.api;

import com.kakrolot.service.approve.api.dto.ShopApproveUserDTO;

import java.util.List;

public interface ShopApproveUserService {

    void save(ShopApproveUserDTO shopApproveUserDTO);

    /**
     * 获取用户需要审批的任务类型列表
     * @param
     * @return
     */
    List<ShopApproveUserDTO> getByUserId(Long userId);

}
