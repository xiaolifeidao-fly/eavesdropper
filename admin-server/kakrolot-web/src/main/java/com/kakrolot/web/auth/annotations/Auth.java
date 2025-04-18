package com.kakrolot.web.auth.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface Auth {

    /**
     * 是否需要拦截
     */
    boolean isIntercept() default true;

}
