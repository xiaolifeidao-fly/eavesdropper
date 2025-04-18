package com.kakrolot.http.proxy;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * @author xianglong
 * @date 2019/7/8
 */
@Slf4j
public abstract class AbsProxyService implements BaseProxyService {

    private ConcurrentLinkedQueue<String> concurrentLinkedQueue = new ConcurrentLinkedQueue();

    private Map<String, String> hadUse = new HashMap<>();


    public abstract int proxyNum();

    @Override
    public List<String> getStaticProxy(int num) {
        Response response = null;
        try {
            String proxyUrl = getProxyUrl();
            String url = proxyUrl + "&num=" + num;
            JSONObject headers = new JSONObject();
            response = OkHttpUtils.doGet(url, headers);
            String result = response.body().string();
            return getProxyIps(result);
        } catch (Exception e) {
            log.error("getStaticProxy error : {}", e);
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }

    protected abstract List<String> getProxyIps(String result);

    protected abstract String getProxyUrl();

    @Override
    public String getProxy() {
        try {
            synchronized (concurrentLinkedQueue) {
                String ip = concurrentLinkedQueue.poll();
                if (StringUtils.isNotBlank(ip)) {
                    return ip;
                }
                List<String> list = getStaticProxy(1);
                // List<String> distinctList = distinct(list);
                while (list == null || list.size() == 0) {
                    Thread.sleep(1000L);
                    list = getStaticProxy(proxyNum());
                    //distinctList = distinct(list);
                }
                initIp(list);
                return concurrentLinkedQueue.poll();
            }
        } catch (Exception e) {
            log.error("getProxy error : {}", e);
            throw new RuntimeException(e);
        }
    }

    protected List<String> distinct(List<String> list) {
        if (list == null || list.size() == 0) {
            return null;
        }
        List<String> distinctList = new ArrayList<>();
        for (String ip : list) {
            if (hadUse.containsKey(ip)) {
                log.info("ip {} is distinct ", ip);
                continue;
            }
        }
        return distinctList;
    }

    private void initIp(List<String> list) {
        for (String ipStr : list) {
            hadUse.put(ipStr, ipStr);
            for (int i = 0; i < 1; i++) {
                concurrentLinkedQueue.add(ipStr);
            }
        }
    }

}
