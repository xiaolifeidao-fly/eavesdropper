package com.kakrolot.web.controller;

import com.kakrolot.business.service.user.UserTokenService;
import com.kakrolot.service.user.api.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author xianglong
 * @date 2019/11/29
 */
public abstract class BaseController {

    @Autowired
    protected UserTokenService userTokenService;

    public HttpServletRequest getServletRequest() {
        return ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
    }

    public HttpServletResponse getServletResponse() {
        return ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getResponse();
    }

    public UserDTO getCurrentUser(){
        return userTokenService.findUserByToken(getToken());
    }

    public String getToken() {
        return getServletRequest().getHeader("X-Token");
    }

    public String getRemoteIp() {
        HttpServletRequest request = getServletRequest();
        String unknown = "unknown";
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || unknown.equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || unknown.equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || unknown.equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip;
    }

}
