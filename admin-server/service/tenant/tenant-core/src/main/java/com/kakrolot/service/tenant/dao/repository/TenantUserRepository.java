package com.kakrolot.service.tenant.dao.repository;

import com.kakrolot.service.tenant.dao.po.TenantUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TenantUserRepository extends JpaRepository<TenantUser, Long> {

    List<TenantUser> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
