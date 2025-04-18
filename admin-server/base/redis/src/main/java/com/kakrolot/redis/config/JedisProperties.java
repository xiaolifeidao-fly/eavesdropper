package com.kakrolot.redis.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @author caoti
 * @date 2019/12/5
 */
@ConfigurationProperties(prefix="spring.jedis")
@Data
public class JedisProperties {
    /**Redis服务器主机ip*/
    private String host = "localhost";
    /**Redis服务器登录密码*/
    private String password;
    /**Redis服务器端口*/
    private int port = 6379;
    /**连接超时时间*/
    private int timeout = 2000;
    /**连接池配置*/
    private Pool pool = new Pool();
}
