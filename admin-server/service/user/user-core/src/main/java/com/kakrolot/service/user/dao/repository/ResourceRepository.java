package com.kakrolot.service.user.dao.repository;

import com.kakrolot.service.user.dao.po.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    @Query(nativeQuery = true, value = "select distinct r.* from resource r left join role_resource r_r on r_r.resource_id = r.id where r_r.role_id in (:roleIds)")
    List<Resource> findByRoleIds(@Param("roleIds") List<Long> roleIds);

    Resource findByResourceUrl(String resourceUrl);
}
