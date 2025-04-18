package com.kakrolot.common.utils;


import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class DySign {

    private final static int[] key1 = new int[]{5, 7, 2, 1, 8, 4, 3, 6};
    private final static int[] key2 = new int[]{1, 5, 3, 8, 7, 2, 6, 4};
    private final static String R_STR = "efc84c17";

    public static String sign(String url) {
        List<String> params = getParams(url);
        Long time = getTime(params);
        if (time == null) {
            return null;
        }
        String param = handlerParams(params);
        String md5 = getMd5(param, time);
        String hexTime = Long.toHexString(time);
        String aa = shuffle(hexTime, key1);
        String bb = shuffle(hexTime, key2);
        String asCp = ppp(md5, aa, bb).toLowerCase();
        int length = asCp.length();
        int index = asCp.length() / 2;
        String as = asCp.substring(0, index);
        String cp = asCp.substring(index, length);
        return url + "&as=" + as + "&cp=" + cp;
    }

    public static String sign(String url, List<String> params) {
        params.add("rstr=" + R_STR);
        List<String> urlParams = getParams(url);
        Long time = getTime(urlParams);
        if (time == null) {
            return null;
        }
        String param = handlerParams(params);
        String md5 = getMd5(param, time);
        String hexTime = Long.toHexString(time);
        String aa = shuffle(hexTime, key1);
        String bb = shuffle(hexTime, key2);
        String asCp = ppp(md5, aa, bb).toLowerCase();
        int length = asCp.length();
        int index = asCp.length() / 2;
        String as = asCp.substring(0, index);
        String cp = asCp.substring(index, length);
        return url + "&as=" + as + "&cp=" + cp;
    }

    private static String ppp(String md5, String aa, String bb) {
        char[] keys = new char[]{'a', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', 'e', '1'};
        char[] md5Chars = md5.toCharArray();
        char[] aaChars = aa.toCharArray();
        char[] bbChars = bb.toCharArray();
        for (int i = 0; i < 8; i++) {
            keys[2 * (i + 1)] = md5Chars[i];
            keys[2 * i + 3] = bbChars[i];
            keys[2 * i + 18] = aaChars[i];
            keys[2 * i + 1 + 18] = md5Chars[i + 24];
        }
        return new String(keys);
    }

    private static String getMd5(String param, long time) {
        if (time % 2 == 0) {
            return MD5.digist(param);
        }
        return MD5.digist(MD5.digist(param));
    }

    private static String handlerParams(List<String> params) {
        Collections.sort(params);
        StringBuilder param = new StringBuilder();
        for (String p : params) {
            String[] pArray = p.split("=");
            if (pArray.length == 2) {
                String value = pArray[1];
                value = value.replace("+", "a");
                value = value.replace(" ", "a");
                param.append(value);
            }
        }
        return param.toString();
    }

    private static Long getTime(List<String> params) {
        for (String param : params) {
            if (param.contains("ts=")) {
                String[] times = param.split("=");
                return Long.valueOf(times[1]);
            }
        }
        return null;
    }

    private static List<String> getParams(String url) {
        int index = url.indexOf("?");
        String param = url.substring(index + 1, url.length());
        param = param + "&rstr=" + R_STR;
        return Arrays.asList(param.split("&"));
    }

    private static String shuffle(String timeHex, int[] key) {
        char[] chars = timeHex.toCharArray();
        StringBuilder stringBuilder = new StringBuilder();
        return stringBuilder.append(sub(chars, key[0])).append(sub(chars, key[1])).append(sub(chars, key[2])).append(sub(chars, key[3])).append(sub(chars, key[4])).append(sub(chars, key[5])).append(sub(chars, key[6])).append(sub(chars, key[7])).toString().toLowerCase();
    }

    private static char sub(char[] chars, int index) {
        return chars[index - 1];
    }
}
