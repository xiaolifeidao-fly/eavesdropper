package com.kakrolot.common.utils;

import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 接口参数加解密工具类
 * Created by roc_peng on 2020/2/19.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */

public class InterfaceSignUtil {

    //点赞获取
    public static String getLoveTaskFromWeb = "getLoveTaskFromWeb";
    //关注获取
    public static String getFollowTaskFromWeb = "getFollowTaskFromWeb";
    //点赞完成
    public static String finishLoveTaskToWeb = "finishLoveTaskToWeb";
    //关注完成
    public static String finishFollowTaskToWeb = "finishFollowTaskToWeb";
    //服务端获取签名任务
    public static String getSignTaskFromWeb = "getSignTaskFromWeb";
    //签名后的数据发送到服务端
    public static String finishSignTaskToWeb = "finishSignTaskToWeb";
    //服务端获取deviceInfo
    public static String getDeviceInfoFromWeb = "getDeviceInfoFromWeb";
    //服务端获取后台点赞任务
    public static String getJsUserTasksFromWeb = "getJsUserTasksFromWeb";
    //服务端完成后台点赞任务
    public static String finishJsUserTasksToWeb = "finishJsUserTasksToWeb";

    public static Map<String,String> signKeys = new HashMap<>();

    static {
        signKeys.put(getLoveTaskFromWeb,"lG853Htv");
        signKeys.put(getFollowTaskFromWeb,"aG532aR5");
        signKeys.put(finishLoveTaskToWeb,"h06LeM1z");
        signKeys.put(finishFollowTaskToWeb,"1i6GnGo7");
        signKeys.put(getSignTaskFromWeb,"nGG6ILg2");
        signKeys.put(finishSignTaskToWeb,"g05LhYrx");
        signKeys.put(getDeviceInfoFromWeb,"1tNld69d");
        signKeys.put(getJsUserTasksFromWeb,"lJ0Yev2j");
        signKeys.put(finishJsUserTasksToWeb,"m4F6lD01");
    }

    public static String encryptParams(String router,String params){
        Date date = new Date();
        long time = date.getTime();
        String currentTime = String.valueOf(time);
        //2.对称加密
        String cipher2 = DESUtil.encryptByTime(params, time);
        //3.RSA加密
        return DESUtil.encrypt(cipher2+currentTime, StandardCharsets.UTF_8,signKeys.get(router));
    }

    public static Map<String,String> decodeParams(String router,String cipherText){
        try {
            String decrypt0 = DESUtil.decrypt(cipherText, StandardCharsets.UTF_8,signKeys.get(router));
            int length = decrypt0.length();
            String decrypt1= decrypt0.substring(0, length - 13);
            String currentTime =  decrypt0.substring(length - 13,length);
            String decrypt2 = DESUtil.decodeByTime(decrypt1, Long.valueOf(currentTime));
            return splitQuery(new URL(decrypt2));
        } catch (Exception e) {
            return null;
        }
    }

    public static Map<String, String> splitQuery(URL url) throws UnsupportedEncodingException {
        Map<String, String> query_pairs = new LinkedHashMap<String, String>();
        String query = url.getQuery();
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            query_pairs.put(URLDecoder.decode(pair.substring(0, idx), "UTF-8"), URLDecoder.decode(pair.substring(idx + 1), "UTF-8"));
        }
        return query_pairs;
    }

    public static void main(String[] args) {
        String str = "http://www.google.com?aid=42343&taskId=你是我的";
        String hobbit = encryptParams(finishLoveTaskToWeb, str);
        Map<String, String> stringStringMap = decodeParams(finishLoveTaskToWeb, hobbit);
        System.out.println(stringStringMap);
    }

}
