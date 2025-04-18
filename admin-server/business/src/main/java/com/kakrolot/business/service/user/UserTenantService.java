package com.kakrolot.business.service.user;

import com.kakrolot.redis.util.RedisUtil;
import com.kakrolot.service.tenant.api.TenantService;
import com.kakrolot.service.tenant.api.dto.TenantUserDTO;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class UserTenantService {

    @Autowired
    private TenantService tenantService;

    @Autowired
    private RedisUtil redisUtil;

    private static final String USER_TENANT_PRE_KEY = "KAKROLOT_USER_TENANT_PRE_KEY_";

    public List<Long> getTenantIdsByUserId(Long userId) {
        String key = buildKey(userId);
        String value = redisUtil.get(key);
        if (StringUtils.isBlank(value)) {
            return initAndGet(userId);
        }
        List<Long> tenantIds = new ArrayList<>();
        String[] tenantIdArray = value.split(",");
        for (String tenantId : tenantIdArray) {
            tenantIds.add(Long.valueOf(tenantId));
        }
        return tenantIds;
    }

    private String buildKey(Long userId) {
        return USER_TENANT_PRE_KEY + userId;
    }

    public List<Long> initAndGet(Long userId) {
        //删除user和tenant对应的缓存
        String key1 = "TENANT_USERID_" + userId;
        redisUtil.del(key1);
        //删除user和tenant组合的str缓存
        String key = buildKey(userId);
        redisUtil.del(key);
        List<TenantUserDTO> tenantUserDTOs = tenantService.findTenantUserByUserId(userId);
        if (tenantUserDTOs == null || tenantUserDTOs.size() == 0) {
            log.warn("could not found tenantUserDTOs by userId :{}", userId);
            return Collections.emptyList();
        }
        List<Long> tenantIds = tenantUserDTOs.stream().map(TenantUserDTO::getTenantId).collect(Collectors.toList());
        StringBuffer tenantIdStr = new StringBuffer();
        for (Long tenantId : tenantIds) {
            tenantIdStr.append(tenantId + ",");
        }
        redisUtil.set(key, tenantIdStr.deleteCharAt(tenantIdStr.length() - 1).toString());
        return tenantIds;
    }
}
