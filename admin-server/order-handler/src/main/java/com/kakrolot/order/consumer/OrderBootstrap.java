package com.kakrolot.order.consumer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.dao.PersistenceExceptionTranslationAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration;

@SpringBootApplication(scanBasePackages = "com.kakrolot.order.consumer", exclude ={PersistenceExceptionTranslationAutoConfiguration.class, ValidationAutoConfiguration.class, DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class})
public class OrderBootstrap {

    public static void main(String[] args) {
        SpringApplication.run(OrderBootstrap.class, args);
    }

}
