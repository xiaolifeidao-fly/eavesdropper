package com.kakrolot.service.user.dao.repository;

import com.kakrolot.service.user.dao.po.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoleRepository extends JpaRepository<Role, Long> {

    List<Role> findAllByActive(Boolean active);

}
