package com.kakrolot.service.tenant.dao.repository;

import com.kakrolot.service.tenant.dao.po.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    Tenant findByCode(String code);

    Tenant findByName(String name);

    Tenant getById(Long tenantId);

    List<Tenant> findAllByActive(Boolean active);

    List<Tenant> findByIdInAndActive(List<Long> ids, Boolean active);

    //List<Tenant> getAll();
}
