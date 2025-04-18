package com.kakrolot.http.proxy.core;

import com.alibaba.fastjson.JSONArray;
import com.kakrolot.http.proxy.AbsProxyService;
import com.kakrolot.http.proxy.QYProxyService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * @author xianglong
 * @date 2019/7/8
 */
@Service
public class QYProxyServiceImpl extends AbsProxyService implements QYProxyService {

    @Value("${proxy.url:http://gev.energy67.top/api/?apikey=dc64d9bc0b866427d970f934b44f1cb8775d6583&type=json&line=unix&proxy_type=secret}")
    private String proxyUrl;

    @Value("${proxy.default.proxy.num:10}")
    private int defaultProxyNum;

    @Override
    public int proxyNum() {
        return defaultProxyNum;
    }

    @Override
    protected List<String> getProxyIps(String result) {
        JSONArray jsonArray = JSONArray.parseArray(result);
        List<String> list = new ArrayList<>();
        for (Object o : jsonArray) {
            list.add(o.toString());
        }
        return list;
    }

    @Override
    protected String getProxyUrl() {
        return proxyUrl;
    }

    @Override
    public String getProxy(String proCity) {
        return null;
    }

    @Override
    public void returnProxy(String ip) {

    }
}
