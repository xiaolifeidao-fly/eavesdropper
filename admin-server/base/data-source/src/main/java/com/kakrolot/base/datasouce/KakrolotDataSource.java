package com.kakrolot.base.datasouce;

import com.alibaba.druid.pool.DruidDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 *
 * @author xiaofeidao
 * @date 2019/4/1
 */
@Configuration
public class KakrolotDataSource {

    @Value("${kakrolot.druid.url}")
    private String url;

    @Value("${kakrolot.druid.driverClassName}")
    private String driverClassName;

    @Value("${kakrolot.druid.userName}")
    private String userName;

    @Value("${kakrolot.druid.password}")
    private String password;

    @Value("${kakrolot.druid.maxActive:10}")
    private int maxActive;

    @Value("${kakrolot.druid.minIdle:5}")
    private int minIdle;

    @Value("${kakrolot.druid.initialSize:1}")
    private int initialSize;

    @Bean(name="dataSource")
    @ConfigurationProperties("spring.datasource.kakrolot.druid")
    public DruidDataSource servantDataSource(){
        DruidDataSource druidDataSource = new DruidDataSource();
        druidDataSource.setUrl(url);
        druidDataSource.setDriverClassName(driverClassName);
        druidDataSource.setUsername(userName);
        druidDataSource.setPassword(password);
        druidDataSource.setMaxActive(maxActive);
        druidDataSource.setMinIdle(minIdle);
        druidDataSource.setInitialSize(initialSize);
        druidDataSource.setMaxWait(30000);
        return druidDataSource;
    }

}
