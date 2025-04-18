package com.kakrolot.service.user.support;

import com.kakrolot.redis.util.RedisUtil;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class UserRoleSupport {

    @Autowired
    private RedisUtil redisUtil;

    public List<Long> getRoleIds(Long userId) {
        String key = buildKey(userId);
        String value = redisUtil.get(key);
        if (StringUtils.isBlank(value)) {
            return Collections.emptyList();
        }
        String[] roleArray = value.split(",");
        List<Long> roleIds = new ArrayList<>();
        for (String roleId : roleArray) {
            roleIds.add(Long.valueOf(roleId));
        }
        return roleIds;
    }

    public void initRoleIds(Long userId, List<Long> roleIds) {
        StringBuffer stringBuffer = new StringBuffer();
        for (Long roleId : roleIds) {
            stringBuffer.append(roleId + ",");
        }
        String key = buildKey(userId);
        stringBuffer.deleteCharAt(stringBuffer.length() - 1).trimToSize();
        redisUtil.set(key, stringBuffer.toString());
    }

    private String buildKey(Long userId) {
        return "Kakrolot_" + "user_role_" + userId;
    }
}
