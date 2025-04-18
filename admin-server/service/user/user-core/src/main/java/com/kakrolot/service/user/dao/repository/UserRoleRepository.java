package com.kakrolot.service.user.dao.repository;

import com.kakrolot.service.user.dao.po.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    void deleteByUserId(Long userId);

    List<UserRole> findByUserId(Long userId);
}
