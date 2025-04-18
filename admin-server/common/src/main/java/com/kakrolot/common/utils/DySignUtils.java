package com.kakrolot.common.utils;

/**
 * @author xianglong
 * @date 2019/11/7
 */
public class DySignUtils {

    static {
        System.load("/Users/xianglong/Documents/development/project/fei/Tiktok/DySignUtils.so");
    }

    /*public native String gettMas(String asCp);

    public native String getAsCp(int ts, String[] params, String deviceId);
*/
    public static native byte[] xLogDecrypt(byte[] content, int size);

}
