package com.kakrolot.web.auth;

import com.kakrolot.business.service.user.UserTenantService;
import com.kakrolot.business.service.user.UserTokenService;
import com.kakrolot.service.common.context.TenantContext;
import com.kakrolot.service.user.api.RoleService;
import com.kakrolot.service.user.api.UserService;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.web.auth.annotations.Auth;
import com.kakrolot.web.model.WebResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class CommonAuth {

    @Autowired
    private UserTokenService userTokenService;

    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private UserTenantService userTenantService;

    public Object validate(ProceedingJoinPoint point, Auth auth, String token, String requestUrl) {
        UserDTO userDTO = null;
        try {
            if (auth != null && !auth.isIntercept()) {
                return point.proceed();
            }
            if (StringUtils.isBlank(token)) {
                return WebResponse.error("user not login", AuthType.NOT_LOGIN);
            }
            userDTO = userTokenService.findUserByToken(token);
            if (userDTO == null) {
                return WebResponse.error("user not login", AuthType.NOT_LOGIN);
            }
            List<Long> roleIds = userService.findRoleIdsByUserId(userDTO.getId());
            if (roleIds == null || roleIds.size() == 0) {
                return WebResponse.error("user not resource", AuthType.REJECT);
            }
            if (!roleService.hadResource(roleIds, requestUrl)) {
                return WebResponse.error("user not resource", AuthType.REJECT);
            }
            List<Long> tenantIds = userTenantService.getTenantIdsByUserId(userDTO.getId());
            if (tenantIds == null || tenantIds.size() == 0) {
                return WebResponse.error("user tenant is null", AuthType.REJECT);
            }
            TenantContext.set(tenantIds);
            Object result = point.proceed();
            userTokenService.flushExpireTime(token);
            return result;
        } catch (Throwable e) {
            log.error("{} - {} handler error : ", userDTO, token, e);
            return WebResponse.error("unknown exception");
        } finally {
            TenantContext.clear();
        }
    }

}
