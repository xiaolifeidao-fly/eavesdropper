package com.kakrolot.http.proxy.core;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@Slf4j
public class ZDYSecurityHttpProxyServiceImpl {

    @Value("${zdy.url:http://www.zdopen.com/PrivateProxy/GetIP/}")
    private String url;

    @Value("${zdy.key:647c6b692164b57f}")
    private String key;

    @Value("${zdy.api:202002121546442049}")
    private String api;

    @Value("${zdy.expireFlushTime:4}")
    private int expireFlushTime;

    private ConcurrentLinkedQueue<JSONObject> ipAllJsonQueueUser = new ConcurrentLinkedQueue<>();


    public JSONObject getUserIpByProxyType(int fetchNum, int ipNum) {
        try {
            synchronized (ZDYSecurityHttpProxyServiceImpl.class) {
                JSONObject ip = ipAllJsonQueueUser.poll();
                if (ip == null) {
                    init(fetchNum, ipNum);
                }
                ip = ipAllJsonQueueUser.poll();
                if (ip == null) {
                    throw new RuntimeException("not found ip");
                }
                return ip;
            }
        } catch (Exception e) {
            log.error("getStaticProxy error : {}", e);
            throw new RuntimeException(e);
        }
    }

    public void init(int fetchNum, int ipNum) {
        Response response = null;
        try {
            String url = this.url + "?api=" + api + "&akey=" + key + "&fitter=1&order=1&type=3&count=" + ipNum;
            Thread.sleep(1000L);
            JSONObject headers = new JSONObject();
            response = OkHttpUtils.doGet(url, headers);
            String result = response.body().string();
            List<JSONObject> list = getJson(result);
            for (int i = 0; i < fetchNum; i++) {
                for (JSONObject r : list) {
                    ipAllJsonQueueUser.offer(r);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }

    protected List<JSONObject> getJson(String result) {
        JSONObject jsonObject = JSONObject.parseObject(result);
        String code = jsonObject.getString("code");
        if (!"10001".equals(code)) {
            return Collections.emptyList();
        }
        JSONArray jsonArray = jsonObject.getJSONObject("data").getJSONArray("proxy_list");
        List<JSONObject> list = new ArrayList<>();
        for (Object o : jsonArray) {
            JSONObject json = (JSONObject) o;
            list.add(json);
        }
        return list;
    }

}
