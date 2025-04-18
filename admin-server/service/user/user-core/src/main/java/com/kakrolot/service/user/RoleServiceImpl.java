package com.kakrolot.service.user;

import com.kakrolot.redis.util.RedisUtil;
import com.kakrolot.service.user.api.ResourceService;
import com.kakrolot.service.user.api.RoleService;
import com.kakrolot.service.user.api.dto.ResourceDTO;
import com.kakrolot.service.user.api.dto.RoleDTO;
import com.kakrolot.service.user.convert.RoleConverter;
import com.kakrolot.service.user.dao.po.Role;
import com.kakrolot.service.user.dao.po.UserRole;
import com.kakrolot.service.user.dao.repository.RoleRepository;
import com.kakrolot.service.user.dao.repository.RoleResourceRepository;
import com.kakrolot.service.user.dao.repository.UserRoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private RoleConverter roleConverter;

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private RoleResourceRepository roleResourceRepository;

    @Autowired
    private RedisUtil redisUtil;

    @Override
    public boolean hadResource(List<Long> roleIds, String resourceUrl) {
        ResourceDTO resourceDTO = resourceService.findByResourceUrl(resourceUrl);
        if (resourceDTO == null) {
            return false;
        }
        Long count = roleResourceRepository.countByRoleIdInAndResourceId(roleIds, resourceDTO.getId());
        return count > 0L;
    }

    @Override
    public List<RoleDTO> findAllRoles() {
        List<Role> roleList = roleRepository.findAll();
        return roleConverter.toDTOs(roleList);
    }

    @Override
    public List<RoleDTO> findAllRolesByActive(Boolean active) {
        List<Role> roleList = roleRepository.findAllByActive(active);
        return roleConverter.toDTOs(roleList);
    }

    @Override
    public RoleDTO findById(Long roleId) {
        Role role = roleRepository.findById(roleId).orElse(null);
        return roleConverter.toDTO(role);
    }

    @Override
    public List<RoleDTO> findRolesByUserId(Long userId) throws Exception {
        String key = "ROLES_USERID_"+userId;
        List<RoleDTO> roleDTOList = redisUtil.getList(key, RoleDTO.class);
        if(CollectionUtils.isEmpty(roleDTOList)) {
            List<UserRole> userRoles = userRoleRepository.findByUserId(userId);
            if (CollectionUtils.isEmpty(userRoles)) {
                return Collections.emptyList();
            }
            roleDTOList = userRoles.stream().map(userRole ->
                    findById(userRole.getRoleId())).collect(Collectors.toList());
            redisUtil.setExList(key,roleDTOList,60*60*24);
        }
        return roleDTOList;
    }
}
