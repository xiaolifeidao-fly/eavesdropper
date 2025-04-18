package com.kakrolot.common.utils;


import sun.misc.BASE64Decoder;

/**
 * @author xiaofeidao
 * @date 2019/6/3
 */
public class HexUtils {

    static final char[] HEX_CHARS = new char[]{'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};


    public static void main(String[] args) {
        String ss = "2e3d3325343330323430333d31303d";
        System.out.println(decryptWithXor(ss));
        String ss1 = "727f6d7d723431333634";
        System.out.println(encryptWithXor("+86 18817353729"));
        /*String[] dd = ("2e3d3325343d36313c323737323230").split("\n");
        for(String d : dd){
            System.out.println(decryptWithXor(d));
        }*/
       /* TimeZone chongqing = TimeZone.getTimeZone("America/New_York");
        System.out.println(chongqing.getOffset(System.currentTimeMillis())/1000);*/

    }
    public static String encryptWithXor(String str) {
        try {
            byte[] bytes = str.getBytes("UTF-8");
            for (int i = 0; i < bytes.length; i++) {
                bytes[i] = (byte) (bytes[i] ^ 5);
            }
            return toHexString(bytes, 0, bytes.length);
        } catch (Exception unused) {
            return str;
        }
    }

    public static String decryptWithXor(String str, Boolean... boolArr) {
        try {
            byte[] hexStringToBytes;
            if (boolArr == null || boolArr.length <= 0 || !boolArr[0].booleanValue()) {
                hexStringToBytes = hexStringToBytes(str);
            } else {
                hexStringToBytes = new BASE64Decoder().decodeBuffer(str);
            }
            for (int i = 0; i < hexStringToBytes.length; i++) {
                hexStringToBytes[i] = (byte) (hexStringToBytes[i] ^ 5);
            }
            return new String(hexStringToBytes, 0, hexStringToBytes.length, "UTF-8");
        } catch (Exception unused) {
            return str;
        }
    }

    public static String byteToString(byte[] bArr) {
        int i = 0;
        char[] toCharArray = "0123456789abcdef".toCharArray();
        char[] cArr = new char[(bArr.length * 2)];
        while (i < bArr.length) {
            int i2 = bArr[i] & 255;
            int i3 = i * 2;
            cArr[i3] = toCharArray[i2 >>> 4];
            cArr[i3 + 1] = toCharArray[i2 & 15];
            i++;
        }
        return new String(cArr);

    }

    public static byte[] hexStringToBytes(String str) throws IllegalArgumentException {
        if (str == null || str.length() % 2 == 1) {
            StringBuilder stringBuilder = new StringBuilder("hexBinary needs to be even-length: ");
            stringBuilder.append(str);
            throw new IllegalArgumentException(stringBuilder.toString());
        }
        char[] toCharArray = str.toCharArray();
        int length = toCharArray.length;
        byte[] bArr = new byte[(length / 2)];
        for (int i = 0; i < length; i += 2) {
            bArr[i / 2] = (byte) ((Character.digit(toCharArray[i], 16) << 4) + Character.digit(toCharArray[i + 1], 16));
        }
        return bArr;
    }

    public static String toHexString(byte[] bArr, int i, int i2) {
        if (bArr == null) {
            throw new NullPointerException("bytes is null");
        } else if (i < 0 || i + i2 > bArr.length) {
            throw new IndexOutOfBoundsException();
        } else {
            int i3 = i2 * 2;
            char[] cArr = new char[i3];
            int i4 = 0;
            for (int i5 = 0; i5 < i2; i5++) {
                int i6 = bArr[i5 + i] & 255;
                int i7 = i4 + 1;
                cArr[i4] = HEX_CHARS[i6 >> 4];
                i4 = i7 + 1;
                cArr[i7] = HEX_CHARS[i6 & 15];
            }
            return new String(cArr, 0, i3);
        }
    }
}
