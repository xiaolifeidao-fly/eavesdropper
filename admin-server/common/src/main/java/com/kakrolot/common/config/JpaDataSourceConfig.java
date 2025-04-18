package com.kakrolot.common.config;

import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * goblin jpa database config
 *
 * @author xiaofeidao
 * @date 2017/6/14
 */
@Configuration
@AutoConfigureBefore({DataSourceAutoConfiguration.class})
@EnableJpaRepositories(
        repositoryFactoryBeanClass = CommonRepositoryFactoryBean.class,
        basePackages = {"com.kakrolot.service.*.dao.repository"})
public class JpaDataSourceConfig {



}
