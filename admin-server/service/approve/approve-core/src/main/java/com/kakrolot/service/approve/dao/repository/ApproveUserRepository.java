package com.kakrolot.service.approve.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.approve.dao.po.ApproveUser;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApproveUserRepository extends CommonRepository<ApproveUser, Long> {

    @Query(nativeQuery = true, value = "delete from approve_user where user_id = :userId")
    @Modifying()
    void deleteByUserId(@Param("userId") Long userId);

    ApproveUser findByUserId(Long userId);
}
