package com.kakrolot.order.gateway.filter;

import com.alibaba.fastjson.JSON;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author Shaun Chyxion <br>
 * chyxion@163.com <br>
 * Mar 19, 2017 21:50:57
 */
@Slf4j
@Component
public class HttpRequestInterceptor implements HandlerInterceptor {


    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        log.info("Request [{}] Params [{}].", JSON.toJSONString(request.getRequestURI()), JSON.toJSONString(request.getParameterMap()));
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            log.info("Header [{}] Value [{}]", headerName, request.getHeader(headerName));
        }
        request.setAttribute("startTime", System.currentTimeMillis());
        return true;
    }


    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {

    }


    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        long requestDuration = System.currentTimeMillis() - (Long) request.getAttribute("startTime");
        log.info("Request [{}] Took {} ms.",
                request.getRequestURI(),
                requestDuration);
    }
}
