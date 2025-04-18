package com.kakrolot.service.user.api;

import com.kakrolot.service.user.api.dto.RoleDTO;

import java.util.List;

public interface RoleService {

    boolean hadResource(List<Long> roleIds, String resourceUrl);

    List<RoleDTO> findAllRoles();

    List<RoleDTO> findAllRolesByActive(Boolean active);

    /**
     * 用户所属的所有角色
     * @param userId
     * @return
     */
    List<RoleDTO> findRolesByUserId(Long userId) throws Exception;

    RoleDTO findById(Long roleId);

}
