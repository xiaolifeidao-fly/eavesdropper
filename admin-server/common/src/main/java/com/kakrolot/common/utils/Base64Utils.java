package com.kakrolot.common.utils;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

/**
 * @author xianglong
 * @date 2019/11/18
 */
public class Base64Utils {

    public static String encodeWithUrl(byte[] bytes) {
        BASE64Encoder base64Encoder = new BASE64Encoder();
        int length = bytes.length;
        int i = 0;
        while (i < length) {

            bytes[i] = (byte) (bytes[i] ^ -99);
            i++;
        }
        String charJia = "\\+";
        String result = base64Encoder.encode(bytes);
        result = result.replaceAll("/", "_");
        result = result.replaceAll(charJia, "-");
        return result;
    }

    public static byte[] decodeWithUrl(String context) {
        try {
            context = context.replaceAll("_", "/");
            String charJia = "\\+";
            context = context.replaceAll("-", charJia);
            BASE64Decoder decoder = new BASE64Decoder();
            byte[] bytes = decoder.decodeBuffer(context);
            int length = bytes.length;
            int i = 0;
            while (i < length) {
                bytes[i] = (byte) (bytes[i] ^ -99);
                i++;
            }
            return bytes;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
