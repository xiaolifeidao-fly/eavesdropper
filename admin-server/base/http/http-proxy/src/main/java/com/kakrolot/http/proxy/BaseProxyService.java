package com.kakrolot.http.proxy;

import java.util.List;

/**
 * @author xianglong
 * @date 2019/7/8
 */
public interface BaseProxyService {

    /**
     * 获取静态代理
     * @param num
     * @return
     */
    List<String> getStaticProxy(int num);

    String getProxy();

    String getProxy(String proCity);

    void returnProxy(String ip);

}
