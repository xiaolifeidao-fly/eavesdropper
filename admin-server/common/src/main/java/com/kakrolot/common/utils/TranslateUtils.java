package com.kakrolot.common.utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by xiaofeidao on 2018/10/3.
 */
public class TranslateUtils {

    /**
     * @param url #抖出微笑秀出幸福 @新力景德镇帝泊湾 https://v.douyin.com/wWqNmh/ 复制此链接，打开【抖音短视频】，直接观看视频！
     * @return https://v.douyin.com/wWqNmh/
     * https://www.iesdouyin.com/share/video/6831839266906197248/?region=CN&amp;amp;mid=6827048090319489038&amp;amp;u_code=17g48fi33&amp;amp;titleType=title&amp;amp;timestamp=1590661567&amp;amp;utm_campaign=client_share&amp;amp;app=aweme&amp;amp;utm_medium=ios&a
     * 返回6831839266906197248
     * 6831839266906197248 返回6831839266906197248
     */
    public static String convertTinyUrl(String url) {
        try {
            String regex = "https://v.douyin.com/[^/]+/";
            Pattern pattern = Pattern.compile(regex);
            Matcher matcher = pattern.matcher(url);
            if (matcher.find()) {
                return matcher.group(0);
            }
            if (url.startsWith("https://www.iesdouyin.com")) {
                regex = "[0-9]+";
                pattern = Pattern.compile(regex);
                matcher = pattern.matcher(url);
                if (matcher.find()) {
                    return matcher.group(0);
                }
            }
            if (url.startsWith("https://www.xiaohongshu.com")) {
                regex = "[0-9a-z]{24}";
                pattern = Pattern.compile(regex);
                matcher = pattern.matcher(url);
                if (matcher.find()) {
                    return matcher.group(0);
                }
            }
            return url;
        } catch (Exception e) {
            e.printStackTrace();
            return url;
        }
    }

    public static String getOrderHashStr(String businessId) {
        try {
            return MD5.digist(businessId + System.currentTimeMillis());
        } catch (Exception e) {
            return String.valueOf(System.currentTimeMillis());
        }
    }

    public static void main(String[] args) {
        TranslateUtils translateUtils = new TranslateUtils();
        String s = translateUtils.convertTinyUrl("https://www.iesdouyin.com/share/video/6831839266906197248/?region=CN&amp;amp;mid=6827048090319489038&amp;amp;u_code=17g48fi33&amp;amp;titleType=title&amp;amp;timestamp=1590661567&amp;amp;utm_campaign=client_share&amp;amp;app=aweme&amp;amp;utm_medium=ios&a");
        System.out.println(s);
        String submit = "SUBMIT_159923";
        String regex = "[A-Z]+_";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(submit);
        if (matcher.find()) {
            String group = matcher.group(0);
            String replace = submit.replace(group, "");
            System.out.println(regex);
        }
    }

}
