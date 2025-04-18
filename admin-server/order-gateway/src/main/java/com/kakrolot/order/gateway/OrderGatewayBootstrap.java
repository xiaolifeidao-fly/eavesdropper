package com.kakrolot.order.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.dao.PersistenceExceptionTranslationAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration;

@SpringBootApplication(scanBasePackages = "com.kakrolot.order.gateway", exclude ={PersistenceExceptionTranslationAutoConfiguration.class, ValidationAutoConfiguration.class, DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class})
public class OrderGatewayBootstrap {

    public static void main(String[] args) {
        SpringApplication.run(OrderGatewayBootstrap.class, args);
    }

}
