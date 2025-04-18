package com.kakrolot.service.tenant;

import com.kakrolot.common.utils.Constant;
import com.kakrolot.redis.util.RedisUtil;
import com.kakrolot.service.tenant.api.TenantService;
import com.kakrolot.service.tenant.api.dto.TenantDTO;
import com.kakrolot.service.tenant.api.dto.TenantUserDTO;
import com.kakrolot.service.tenant.convert.TenantConverter;
import com.kakrolot.service.tenant.convert.TenantUserConverter;
import com.kakrolot.service.tenant.dao.po.Tenant;
import com.kakrolot.service.tenant.dao.po.TenantUser;
import com.kakrolot.service.tenant.dao.repository.TenantRepository;
import com.kakrolot.service.tenant.dao.repository.TenantUserRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TenantServiceImpl implements TenantService {

    @Autowired
    private TenantConverter tenantConverter;

    @Autowired
    private TenantUserConverter tenantUserConverter;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private TenantUserRepository tenantUserRepository;

    @Autowired
    private RedisUtil redisUtil;

    @Override
    public List<TenantUserDTO> findTenantUserByUserId(Long userId) {
        List<TenantUser> tenantUsers = tenantUserRepository.findByUserId(userId);
        return tenantUserConverter.toDTOs(tenantUsers);
    }

    @Override
    public List<TenantDTO> findTenantByUserId(Long userId) throws Exception {
        String key = "TENANT_USERID_" + userId;
        List<TenantDTO> tenantDTOList = redisUtil.getList(key, TenantDTO.class);
        if (CollectionUtils.isEmpty(tenantDTOList)) {
            List<TenantUserDTO> tenantUserDTOList = findTenantUserByUserId(userId);
        if (CollectionUtils.isEmpty(tenantUserDTOList)) {
            return Collections.emptyList();
        }
            tenantDTOList = tenantUserDTOList.stream().map(tenantUserDTO ->
                    findById(tenantUserDTO.getTenantId())).collect(Collectors.toList());
            redisUtil.setExList(key, tenantDTOList, 60 * 60 * 24);
        }
        return tenantDTOList;
    }

    @Override
    @Transactional
    public void saveTenantUser(List<Long> tenantIds, Long userId) {
        tenantUserRepository.deleteByUserId(userId);
        if (tenantIds == null || tenantIds.size() == 0) {
            return;
        }
        for (Long tenantId : tenantIds) {
            TenantUser tenantUser = new TenantUser();
            tenantUser.setTenantId(tenantId);
            tenantUser.setUserId(userId);
            tenantUser.setActive(Constant.ACTIVE);
            tenantUserRepository.save(tenantUser);
        }
    }

    @Override
    public TenantDTO findByCode(String code) {
        Tenant tenant = tenantRepository.findByCode(code);
        return tenantConverter.toDTO(tenant);
    }

    @Override
    public TenantDTO findByName(String name) {
        Tenant tenant = tenantRepository.findByName(name);
        return tenantConverter.toDTO(tenant);
    }

    @Override
    public void save(TenantDTO tenantDTO) {
        Tenant tenant = tenantConverter.toPo(tenantDTO);
        tenantRepository.save(tenant);
    }

    @Override
    public TenantDTO findById(Long tenantId) {
        Tenant tenant = tenantRepository.getById(tenantId);
        return tenantConverter.toDTO(tenant);
    }

    @Override
    public List<TenantDTO> getAll() {
        List<Tenant> tenants = tenantRepository.findAll();
        return tenantConverter.toDTOs(tenants);
    }

    @Override
    public List<TenantDTO> getAllActive() {
        List<Tenant> tenants = tenantRepository.findAllByActive(Constant.ACTIVE);
        return tenantConverter.toDTOs(tenants);
    }

    @Override
    public List<TenantDTO> getAllActiveByIds(List<Long> ids) {
        List<Tenant> tenants = tenantRepository.findByIdInAndActive(ids, Constant.ACTIVE);
        return tenantConverter.toDTOs(tenants);
    }
}
