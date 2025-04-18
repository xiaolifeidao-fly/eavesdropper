package com.kakrolot.common.utils;

import org.apache.commons.codec.binary.Base64;

import javax.crypto.Cipher;
import java.security.*;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by roc_peng on 2020/2/16.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */

public class RSAUtils {

    public static String desKey = "UjA4GnAD";

    public static String publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCUjcsQLLndJxx31iKc8k70CtjRRmvniQPJexIeq3DL6tTslNgoTfiPnfBRQiNrpdk91iZWBohp8cApl14RGDej9TPrjqh+IFf3piRXduOugJ51V4zYDLFaKF82uoZcdEFEp64t0F0zTigqL3TrUhJMEHPN4UjHd30rIfAItb4RoQIDAQAB";

    public static String privateKey = "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAJSNyxAsud0nHHfWIpzyTvQK2NFGa+eJA8l7Eh6rcMvq1OyU2ChN+I+d8FFCI2ul2T3WJlYGiGnxwCmXXhEYN6P1M+uOqH4gV/emJFd2466AnnVXjNgMsVooXza6hlx0QUSnri3QXTNOKCovdOtSEkwQc83hSMd3fSsh8Ai1vhGhAgMBAAECgYEAibblP+pmp5lBb+qojdynyt9fXqqtD6jaROb9xkbiu3fIykW2Ga8mtWUSSxJIKdxHB2dGhMtrnOOLZEM55hkQQlpU1LDPWdlVgCLBR+ttPAWT0w+G2RpYhgeEiyc4jZ7l726sb8p/Qr8fDUjsgiMhw7VQ6L1VuuJfT0M2i71edM0CQQDDTet2KaNqyaJ0lClY/Aa4FzJ5Kay9g8YruPODw1YETx8NKH1sJcx98CLPr6V9wcWPlPSv5x+57UpS+0M6GX2XAkEAwrh8B2ehUhh7zEYbCvn/7emXpDw5WSykHMNxhMZEH4awalTRNSZYADNTHU4w0UKUM51sQ9KWowlLvot36hLBhwJAF6KHWy5gy1yJX2hKtK0TNxX/krAbanfW9JWWSpzJ/Q2CKXp76ymL3LXB0LZl5ZkcimqxTdQ/f6Wat/4WPaK2EwJBAKU2DB3oQkq6dUdTcBx3EzuUB1KUun+7zZ6OASILar9o8wO05TB4URASfAGQVwElwUKt3a8J3T+FYpvQD7Utpr8CQQCkun9dl2/3tz2ubJ+YIum4Netyfq7CBaLyuQKFV6YB1kQo8qiq7bOvxhFKUON/CqFF1JR30MZC7T/jDHTbN7+T";

    public static Map<Integer, String> keyMap = new HashMap<Integer, String>();  //用于封装随机产生的公钥与私钥

    public static void main(String[] args) throws Exception {
        String str = "taskInstanceId={taskInstanceId}&userTaskId={userTaskId}&result={result}";
        String encrypt = encrypt(str, publicKey);
        String decrypt = decrypt(encrypt, privateKey);
        System.out.println(decrypt);
    }
    /**
     * 随机生成密钥对
     *
     * @throws NoSuchAlgorithmException
     */
    public static void genKeyPair() throws NoSuchAlgorithmException {
        // KeyPairGenerator类用于生成公钥和私钥对，基于RSA算法生成对象
        KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("RSA");
        // 初始化密钥对生成器，密钥大小为96-1024位
        keyPairGen.initialize(1024, new SecureRandom());
        // 生成一个密钥对，保存在keyPair中
        KeyPair keyPair = keyPairGen.generateKeyPair();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();   // 得到私钥
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();  // 得到公钥
        String publicKeyString = new String(Base64.encodeBase64(publicKey.getEncoded()));
        // 得到私钥字符串
        String privateKeyString = new String(Base64.encodeBase64((privateKey.getEncoded())));
        // 将公钥和私钥保存到Map
        keyMap.put(0, publicKeyString);  //0表示公钥
        keyMap.put(1, privateKeyString);  //1表示私钥
    }

    /**
     * RSA公钥加密
     *
     * @param str       加密字符串
     * @param publicKey 公钥
     * @return 密文
     * @throws Exception 加密过程中的异常信息
     */
    public static String encrypt(String str, String publicKey) {
        try {
            //base64编码的公钥
            byte[] decoded = Base64.decodeBase64(publicKey);
            RSAPublicKey pubKey = (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(decoded));
            //RSA加密
            Cipher cipher = Cipher.getInstance("RSA");
            cipher.init(Cipher.ENCRYPT_MODE, pubKey);
            String outStr = Base64.encodeBase64String(cipher.doFinal(str.getBytes("UTF-8")));
            return outStr;
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * RSA私钥解密
     *
     * @param str        加密字符串
     * @param privateKey 私钥
     * @return 铭文
     * @throws Exception 解密过程中的异常信息
     */
    public static String decrypt(String str, String privateKey) throws Exception {
        //64位解码加密后的字符串
        byte[] inputByte = Base64.decodeBase64(str.getBytes("UTF-8"));
        //base64编码的私钥
        byte[] decoded = Base64.decodeBase64(privateKey);
        RSAPrivateKey priKey = (RSAPrivateKey) KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(decoded));
        //RSA解密
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.DECRYPT_MODE, priKey);
        String outStr = new String(cipher.doFinal(inputByte));
        return outStr;
    }

}