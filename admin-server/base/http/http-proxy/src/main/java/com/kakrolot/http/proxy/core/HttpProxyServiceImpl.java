package com.kakrolot.http.proxy.core;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.http.proxy.AbsProxyService;
import com.kakrolot.http.proxy.HttpProxyService;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * @author xiaofeidao
 * @date 2019/5/16
 */
@Service
@Slf4j
public class HttpProxyServiceImpl extends AbsProxyService implements HttpProxyService {


    @Value("${proxy.url:http://http.tiqu.alicdns.com/getip3?type=2&pro=&city=0&yys=0&port=11&ts=1&ys=0&cs=0&lb=1&sb=0&pb=45&mr=1&regions=}")
    private String proxyUrl;

    @Value("${proxy.default.proxy.num:1}")
    private int defaultProxyNum;

    @Value("${proxy.default.proxy.time:1}")
    private int defaultTime;

    private ConcurrentLinkedQueue<String> ipQueue = new ConcurrentLinkedQueue();

    private ConcurrentLinkedQueue<JSONObject> ipJsonQueue = new ConcurrentLinkedQueue();

    private ConcurrentLinkedQueue<JSONObject> ipJsonQueueOne = new ConcurrentLinkedQueue();

    private ConcurrentLinkedQueue<JSONObject> ipJsonQueueUser = new ConcurrentLinkedQueue();


    @Value("${http.proxy.fetch.num:5}")
    private int fetchNum;

    @Override
    public int proxyNum() {
        return defaultProxyNum;
    }

    @Override
    protected List<String> getProxyIps(String result) {
        JSONObject jsonObject = JSONObject.parseObject(result);
        boolean success = jsonObject.getBoolean("success");
        if (!success) {
            return Collections.emptyList();
        }
        JSONArray jsonArray = jsonObject.getJSONArray("data");
        List<String> list = new ArrayList<>();
        for (Object o : jsonArray) {
            JSONObject json = (JSONObject) o;
            String ip = json.getString("ip");
            String port = json.getString("port");
            list.add(ip + ":" + port);
        }
        return list;
    }

    @Override
    protected String getProxyUrl() {
        return proxyUrl + "&time=" + defaultProxyNum;
    }

    @Override
    public String getByProxyType(String value) {
        return getByProxyType(value, 5);
    }

    @Override
    public JSONObject getJsonByProxyType(String value, int num, int fetchNum) {
        Response response = null;
        try {
            synchronized (HttpProxyServiceImpl.class) {
                JSONObject ip = ipJsonQueue.poll();
                if (ip == null) {
                    String url = "http://webapi.http.zhimacangku.com/getip?type=2&pro=&city=0&yys=0&port=11&ts=1&ys=0&cs=0&lb=1&sb=0&pb=4&mr=1&regions=" + "&num=" + fetchNum + "&time=" + value;
                    Thread.sleep(1000L);
                    JSONObject headers = new JSONObject();
                    response = OkHttpUtils.doGet(url, headers);
                    String result = response.body().string();
                    List<JSONObject> list = getJson(result);
                    /*list = distinct(list);
                    if (list == null || list.size() == 0) {
                        return null;
                    }*/
                    for (int i = 0; i < num; i++) {
                        for (JSONObject r : list) {
                            ipJsonQueue.offer(r);
                        }
                    }
                    ip = ipJsonQueue.poll();
                }
                if (ip == null) {
                    throw new RuntimeException("not found ip");
                }
                return ip;
            }
        } catch (Exception e) {
            log.error("getStaticProxy error : {}", e);
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }


    @Override
    public JSONObject getJsonByProxyTypeOne(String value, int num, int fetchNum) {
        Response response = null;
        try {
            synchronized (HttpProxyServiceImpl.class) {
                JSONObject ip = ipJsonQueueOne.poll();
                if (ip == null) {
                    String url = "http://webapi.http.zhimacangku.com/getip?type=2&pro=&city=0&yys=0&port=11&ts=1&ys=0&cs=0&lb=1&sb=0&pb=4&mr=1&regions=" + "&num=" + fetchNum + "&time=" + value;
                    Thread.sleep(1000L);
                    JSONObject headers = new JSONObject();
                    response = OkHttpUtils.doGet(url, headers);
                    String result = response.body().string();
                    List<JSONObject> list = getJson(result);
                    /*list = distinct(list);
                    if (list == null || list.size() == 0) {
                        return null;
                    }*/
                    for (int i = 0; i < num; i++) {
                        for (JSONObject r : list) {
                            ipJsonQueueOne.offer(r);
                        }
                    }
                    ip = ipJsonQueueOne.poll();
                }
                if (ip == null) {
                    throw new RuntimeException("not found ip");
                }
                return ip;
            }
        } catch (Exception e) {
            log.error("getStaticProxy error : {}", e);
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }


    @Override
    public JSONObject getUserIpByProxyType(String value, int num, int fetchNum) {
        Response response = null;
        try {
            synchronized (HttpProxyServiceImpl.class) {
                JSONObject ip = ipJsonQueueUser.poll();
                if (ip == null) {
                    String url = "http://webapi.http.zhimacangku.com/getip?type=2&pro=&city=0&yys=0&port=11&ts=1&ys=0&cs=0&lb=1&sb=0&pb=4&mr=1&regions=" + "&num=" + num + "&time=" + value;
                    Thread.sleep(1000L);
                    JSONObject headers = new JSONObject();
                    response = OkHttpUtils.doGet(url, headers);
                    String result = response.body().string();
                    List<JSONObject> list = getJson(result);
                    for (int i = 0; i < fetchNum; i++) {
                        for (JSONObject r : list) {
                            ipJsonQueueUser.offer(r);
                        }
                    }
                    ip = ipJsonQueueUser.poll();
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
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }

    protected List<JSONObject> getJson(String result) {
        JSONObject jsonObject = JSONObject.parseObject(result);
        boolean success = jsonObject.getBoolean("success");
        if (!success) {
            return Collections.emptyList();
        }
        JSONArray jsonArray = jsonObject.getJSONArray("data");
        List<JSONObject> list = new ArrayList<>();
        for (Object o : jsonArray) {
            JSONObject json = (JSONObject) o;
            list.add(json);
        }
        return list;
    }

    @Override
    public String getByProxyType(String value, int num) {
        Response response = null;
        try {
            synchronized (HttpProxyServiceImpl.class) {
                String ip = ipQueue.poll();
                if (StringUtils.isBlank(ip)) {
                    String url = proxyUrl + "&num=" + 1 + "&time=" + value;
                    Thread.sleep(1000L);
                    JSONObject headers = new JSONObject();
                    response = OkHttpUtils.doGet(url, headers);
                    String result = response.body().string();
                    List<String> list = getProxyIps(result);
                    /*list = distinct(list);
                    if (list == null || list.size() == 0) {
                        return null;
                    }*/
                    for (String r : list) {
                        for (int i = 0; i < num; i++) {
                            ipQueue.offer(r);
                        }
                    }
                    ip = ipQueue.poll();
                }
                if (StringUtils.isBlank(ip)) {
                    throw new RuntimeException("not found ip");
                }
                return ip;
            }
        } catch (Exception e) {
            log.error("getStaticProxy error : {}", e);
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }

    @Override
    public void returnProxy(String ip) {
        /*synchronized (HttpProxyServiceImpl.class) {
            ipQueue.offer(ip);
        }*/
    }

    @Override
    public String getProxy(String proCity) {
        Response response = null;
        try {
            String[] proCitys = proCity.split(":");
            String proxyUrl = getProxyUrl();
            String url = proxyUrl + "&num=1&pro=" + proCitys[0];
            //+ "&city=" + proCitys[1];
            JSONObject headers = new JSONObject();
            response = OkHttpUtils.doGet(url, headers);
            String result = response.body().string();
            List<String> list = getProxyIps(result);
            if (list == null || list.size() == 0) {
                return null;
            }
            return list.get(0);
        } catch (Exception e) {
            log.error("getStaticProxy error : {}", e);
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }
}
