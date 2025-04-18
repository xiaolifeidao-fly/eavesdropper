package com.kakrolot.service.user.dao.repository;

import com.kakrolot.service.user.dao.po.RoleResource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoleResourceRepository extends JpaRepository<RoleResource, Long> {

    Long countByRoleIdInAndResourceId(List<Long> roleIds, Long id);
}
