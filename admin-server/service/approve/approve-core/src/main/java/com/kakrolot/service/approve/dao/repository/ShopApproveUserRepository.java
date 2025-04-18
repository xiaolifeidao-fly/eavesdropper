package com.kakrolot.service.approve.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.approve.dao.po.ShopApproveUser;

import java.util.List;

public interface ShopApproveUserRepository extends CommonRepository<ShopApproveUser, Long> {

    List<ShopApproveUser> findByUserId(Long userId);
}
