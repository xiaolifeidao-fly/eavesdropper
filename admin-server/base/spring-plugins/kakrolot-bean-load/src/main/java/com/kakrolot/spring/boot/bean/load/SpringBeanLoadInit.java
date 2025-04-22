package com.kakrolot.spring.boot.bean.load;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;

/**
 *
 * @author xiaofeidao
 * @date 2018/10/1
 */
@ImportResource("classpath*:spring/spring-*.xml")
@Configuration
public class SpringBeanLoadInit implements InitializingBean{


    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("");
    }
}
