package com.kakrolot.http.proxy;

import com.alibaba.fastjson.JSONObject;

/**
 *
 * @author xiaofeidao
 * @date 2019/5/16
 */
public interface HttpProxyService extends BaseProxyService {


    String getByProxyType(String value);

    JSONObject getJsonByProxyTypeOne(String value, int num, int fetchNum);

    JSONObject getUserIpByProxyType(String value, int num, int fetchNum);

    String getByProxyType(String value, int num);

    JSONObject getJsonByProxyType(String value, int num, int fetchNum);
}
