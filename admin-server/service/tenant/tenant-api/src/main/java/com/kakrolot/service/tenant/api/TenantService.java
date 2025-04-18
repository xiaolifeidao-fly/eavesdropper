package com.kakrolot.service.tenant.api;

import com.kakrolot.service.tenant.api.dto.TenantDTO;
import com.kakrolot.service.tenant.api.dto.TenantUserDTO;

import java.util.List;

public interface TenantService {

    List<TenantUserDTO> findTenantUserByUserId(Long userId);

    /**
     * 用户所属的所有租户信息
     * @param userId
     * @return
     */
    List<TenantDTO> findTenantByUserId(Long userId) throws Exception;

    void saveTenantUser(List<Long> tenantIds, Long userId);

    TenantDTO findByCode(String code);

    TenantDTO findByName(String name);

    void save(TenantDTO tenantDTO);

    TenantDTO findById(Long tenantId);

    List<TenantDTO> getAll();

    List<TenantDTO> getAllActive();

    List<TenantDTO> getAllActiveByIds(List<Long> ids);
}
