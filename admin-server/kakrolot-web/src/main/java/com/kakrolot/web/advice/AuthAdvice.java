package com.kakrolot.web.advice;

import com.kakrolot.web.auth.CommonAuth;
import com.kakrolot.web.auth.annotations.Auth;
import com.kakrolot.web.controller.BaseController;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RequestMapping;

import java.lang.reflect.Method;

/**
 * 权限切面
 *
 * @author xianglong
 * Created on 2018/3/8.
 */
@Aspect
@Configuration
@Slf4j
public class AuthAdvice {

    @Autowired
    private CommonAuth commonAuth;

    private static final String ERROR_MESSAGE = "无权限访问";

    @Pointcut("execution(* com.kakrolot.web.controller..*.*(..))")
    public void invoke() {

    }

    @AfterThrowing(pointcut = "invoke()", throwing = "ex")
    public void logException(JoinPoint joinPoint, Exception ex) {
        log.error("controller exception, signature : {}, error : {}", joinPoint.getSignature(), ex.getMessage(), ex);
    }

    @Around("invoke()")
    public Object validate(ProceedingJoinPoint point) throws Throwable {
        Object target = point.getTarget();
        Method method = getMethod(point);
        RequestMapping requestMapping = method.getAnnotation(RequestMapping.class);
        //非接口方法直接放行
        if (requestMapping == null) {
            return point.proceed();
        }
        return validateAuth(requestMapping, point, (BaseController) target, method, requestMapping);
    }

    private Object validateAuth(RequestMapping requestMapping, ProceedingJoinPoint point, BaseController baseController, Method method, RequestMapping methodRequestMapping) throws Throwable {
        Auth auth = getAuthAnnotation(method);
        String requestUrl = getRequestUrl(baseController, methodRequestMapping);
        Object[] args = point.getArgs();
        return commonAuth.validate(point, auth, baseController.getToken(), requestUrl);
    }

    private String getRequestUrl(BaseController baseController, RequestMapping methodRequestMapping) {
        RequestMapping classRequestMapping = baseController.getClass().getAnnotation(RequestMapping.class);
        String methodUrl = methodRequestMapping.value()[0];
        String classUrl = classRequestMapping.value()[0];
        String url = classUrl + "" + methodUrl;
        url = url.replace("//", "/");
        return url;
    }

    private Auth getAuthAnnotation(Method method) {
        Auth auth = method.getAnnotation(Auth.class);
        if (auth == null) {
            return AuthAdvice.class.getAnnotation(Auth.class);
        }
        return auth;
    }

    private Method getMethod(ProceedingJoinPoint point) {
        Signature signature = point.getSignature();
        MethodSignature methodSignature = (MethodSignature) signature;
        return methodSignature.getMethod();
    }
}
