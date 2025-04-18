package com.kakrolot.http.proxy.core;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.common.utils.DateUtils;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@Slf4j
public class ZDYHttpProxyServiceImpl {

    @Value("${zdy.url:http://www.zdopen.com/ExclusiveProxy/GetIP/}")
    private String url;

    @Value("${zdy.key:8457f98e0c01b691}")
    private String key;

    @Value("${zdy.api:202001101120511048}")
    private String api;

    private Map<String, ConcurrentLinkedQueue<JSONObject>> ipAllJsonQueueUser = new HashMap<>();

    private Map<String, ConcurrentLinkedQueue<JSONObject>> ipJsonQueueUser = new HashMap<>();

    public JSONObject getUserIpByProxyType(int fetchNum, String area, String api, String key) {
        try {
            synchronized (HttpProxyServiceImpl.class) {
                if (StringUtils.isBlank(api)) {
                    this.api = api;
                }
                if (StringUtils.isBlank(key)) {
                    this.key = key;
                }
                String queueKey = "queue_key_" + api + "_" + key;
                ConcurrentLinkedQueue<JSONObject> currentQueue = ipAllJsonQueueUser.get(queueKey);
                if (currentQueue == null) {
                    currentQueue = new ConcurrentLinkedQueue<>();
                    ipAllJsonQueueUser.put(queueKey, currentQueue);
                }
                JSONObject ip = getByQueue(currentQueue);
                if (ip == null) {
                    init(fetchNum, currentQueue);
                    ip = getByQueue(currentQueue);
                }
                //log.info("get proxyIp {}", ip);
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

    public JSONObject getUserIpByProxyType(int fetchNum, String area) {
        return getUserIpByProxyType(fetchNum, area, api, key);
    }

    private JSONObject getByQueue(ConcurrentLinkedQueue<JSONObject> currentQueue) {
        return currentQueue.poll();
    }

    public boolean ipExpire(JSONObject ip, Date now) {
        Date expireTime = ip.getDate("expireTime");
        if (now.getTime() >= expireTime.getTime()) {
            return true;
        }
        return false;
    }

    public void init(int fetchNum, ConcurrentLinkedQueue<JSONObject> currentQueue) {
        Response response = null;
        try {
            String url = this.url + "?api=" + api + "&akey=" + key + "&pro=1&order=2&type=3";
            Thread.sleep(1000L);
            JSONObject headers = new JSONObject();
            response = OkHttpUtils.doGet(url, headers);
            String result = response.body().string();
            List<JSONObject> list = getJson(result);
            for (int i = 0; i < fetchNum; i++) {
                for (JSONObject r : list) {
                    long timeOut = r.getLong("timeout");
                    Date useTime = new Date();
                    r.put("useTime", useTime);
                    Date expireTime = DateUtils.addDateBySecond(useTime, timeOut);
                    r.put("expireTime", expireTime);
                    currentQueue.offer(r);
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
