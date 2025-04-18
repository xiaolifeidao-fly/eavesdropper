package com.kakrolot.web.filter;

import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Configuration;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.annotation.WebInitParam;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * @author caoti
 * @date 2020/2/1
 */
@Configuration
@WebFilter(filterName = "corsFilter", urlPatterns = "/*",
        initParams = {@WebInitParam(name = "allowOrigin", value = "*"),
                @WebInitParam(name = "allowMethods", value = "GET,POST,PUT,DELETE,OPTIONS"),
                @WebInitParam(name = "allowCredentials", value = "true"),
                @WebInitParam(name = "allowHeaders", value = "Content-Type,X-Token")})
public class CorsFilter implements Filter {
    private String allowOrigin="*";
    private String allowMethods= "GET,POST,PUT,DELETE,OPTIONS";
    private String allowCredentials="true";
    private String allowHeaders="Content-Type,X-Token";
    private String exposeHeaders="*";

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        if (!StringUtils.isEmpty(allowOrigin)) {
            if(allowOrigin.equals("*")){
                response.setHeader("Access-Control-Allow-Origin", allowOrigin);
            }else{
                List<String> allowOriginList = Arrays.asList(allowOrigin.split(","));
                if (allowOriginList != null && allowOriginList.size() > 0) {
                    String currentOrigin = request.getHeader("Origin");
                    if (allowOriginList.contains(currentOrigin)) {
                        response.setHeader("Access-Control-Allow-Origin", currentOrigin);
                    }
                }
            }
        }
        if (!StringUtils.isEmpty(allowMethods)) {
            response.setHeader("Access-Control-Allow-Methods", allowMethods);
        }
        if (!StringUtils.isEmpty(allowCredentials)) {
            response.setHeader("Access-Control-Allow-Credentials", allowCredentials);
        }
        if (!StringUtils.isEmpty(allowHeaders)) {
            response.setHeader("Access-Control-Allow-Headers", allowHeaders);
        }
        if (!StringUtils.isEmpty(exposeHeaders)) {
            response.setHeader("Access-Control-Expose-Headers", exposeHeaders);
        }
        response.setHeader("x-frame-options", "SAMEORIGIN");
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
