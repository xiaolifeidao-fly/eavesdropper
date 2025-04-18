package com.kakrolot.common.utils;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;

/**
 * @author xianglong
 * @date 2019/11/29
 */
public class XStubUtils {

    private static final char[] f41866a = new char[]{'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'};

    public static String encode(byte[] bArr) {
        try {
            return new String(encode(MessageDigest.getInstance("MD5").digest(bArr), f41866a));
        } catch (Throwable unused) {
            return null;
        }
    }

    public static void main(String[] args) throws UnsupportedEncodingException {
        System.out.println(encode("item_id=6748446889412283662&first_install_time=-1&play_delta=1&action_time=1575279066&tab_type=0&aweme_type=0".getBytes("utf-8")));
        //ED5E359C4D08E4D76BDBF3BAF15C929B
        //ED5E359C4D08E4D76BDBF3BAF15C929B
    }

    /* renamed from: a */
    private static char[] encode(byte[] bArr, char[] cArr) {
        int length = bArr.length;
        char[] cArr2 = new char[(length << 1)];
        int i = 0;
        for (int i2 = 0; i2 < length; i2++) {
            int i3 = i + 1;
            cArr2[i] = cArr[(bArr[i2] & 240) >>> 4];
            i = i3 + 1;
            cArr2[i3] = cArr[bArr[i2] & 15];
        }
        return cArr2;
    }
}
