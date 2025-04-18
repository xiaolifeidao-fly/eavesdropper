package com.kakrolot.base.http.okhttp;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.google.common.net.HttpHeaders;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import okio.Buffer;
import okio.BufferedSink;
import okio.Okio;
import okio.Source;
import org.apache.commons.lang3.StringUtils;

import javax.net.ssl.*;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * @author xiaofeidao
 * @date 2019/4/21
 */
@Slf4j
public class OkHttpUtils {

    private static final String TAG = "dy-sign-request";

    public static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    public static ConnectionPool pool = new ConnectionPool(200, 5L, TimeUnit.MINUTES);

    private static MyTrustManager mMyTrustManager;


    private static OkHttpClient okHttpClient = new OkHttpClient.Builder()
            //.sslSocketFactory(createSSLSocketFactory(), mMyTrustManager)
            //.hostnameVerifier(new TrustAllHostnameVerifier())
            .retryOnConnectionFailure(true)
            .connectionPool(pool)
            .connectTimeout(60, TimeUnit.SECONDS) //连接超时
            .readTimeout(60, TimeUnit.SECONDS) //读取超时
            .writeTimeout(60, TimeUnit.SECONDS).build();

    private static OkHttpClient okHttpClientLongTimeout = new OkHttpClient.Builder()
            //.sslSocketFactory(createSSLSocketFactory(), mMyTrustManager)
            //.hostnameVerifier(new TrustAllHostnameVerifier())
            .retryOnConnectionFailure(true)
            .connectionPool(pool)
            .connectTimeout(30, TimeUnit.SECONDS) //连接超时
            .readTimeout(30, TimeUnit.SECONDS) //读取超时
            .writeTimeout(30, TimeUnit.SECONDS).build();


    private static SSLSocketFactory createSSLSocketFactory() {
        SSLSocketFactory ssfFactory = null;
        try {
            mMyTrustManager = new MyTrustManager();
            SSLContext sc = SSLContext.getInstance("TLS");
            sc.init(null, new TrustManager[]{mMyTrustManager}, new SecureRandom());
            ssfFactory = sc.getSocketFactory();
        } catch (Exception ignored) {
            ignored.printStackTrace();
        }

        return ssfFactory;
    }

    //实现X509TrustManager接口
    public static class MyTrustManager implements X509TrustManager {
        @Override
        public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
        }

        @Override
        public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
        }

        @Override
        public X509Certificate[] getAcceptedIssuers() {
            return new X509Certificate[0];
        }
    }

    //实现HostnameVerifier接口
    private static class TrustAllHostnameVerifier implements HostnameVerifier {
        @Override
        public boolean verify(String hostname, SSLSession session) {
            return true;
        }
    }

    private static OkHttpClient.Builder getOkHttpClientBuilder() {
        OkHttpClient.Builder okHttpClientBuilder = new OkHttpClient.Builder()
                .retryOnConnectionFailure(true)
                .connectTimeout(10, TimeUnit.SECONDS) //连接超时
                .readTimeout(10, TimeUnit.SECONDS) //读取超时
                .writeTimeout(10, TimeUnit.SECONDS) //写超时
                .connectionPool(pool);
        return okHttpClientBuilder;
    }

    private static OkHttpClient.Builder getOkHttpClientBuilder(Proxy proxy, String userName, String password) {
        OkHttpClient.Builder okHttpClientBuilder = new OkHttpClient.Builder()
                .retryOnConnectionFailure(true)
                .connectTimeout(10, TimeUnit.SECONDS) //连接超时
                .readTimeout(10, TimeUnit.SECONDS) //读取超时
                .writeTimeout(10, TimeUnit.SECONDS) //写超时
                .connectionPool(pool);
        okHttpClientBuilder.proxy(proxy);
        if (StringUtils.isNotBlank(userName) && StringUtils.isNotBlank(password)) {
            Authenticator proxyAuthenticator = (route, response) -> {
                String credential = Credentials.basic(userName, password);
                return response.request().newBuilder()
                        .header("Proxy-Authorization", credential)
                        .build();
            };
            okHttpClientBuilder.proxyAuthenticator(proxyAuthenticator);
        }
        return okHttpClientBuilder;
    }


    public static Response doGet(final String url, JSONObject headers) {
        try {
            Request.Builder requestBuild = new Request.Builder().url(url).get();
            initHeader(requestBuild, headers);
            Request request = requestBuild.build();
            requestBuild.addHeader(HttpHeaders.CONNECTION,"close");
            return okHttpClient.newCall(request).execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Response doGetLongTimeout(final String url, JSONObject headers) {
        try {
            Request.Builder requestBuild = new Request.Builder().url(url).get();
            initHeader(requestBuild, headers);
            Request request = requestBuild.build();
            requestBuild.addHeader(HttpHeaders.CONNECTION,"close");
            return okHttpClientLongTimeout.newCall(request).execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Response doPost(String url, JSONObject requestBody, String contentType, JSONObject headers) {
        try {
            RequestBody body = getRequestBody(requestBody, contentType);
            Request.Builder requestBuild = new Request.Builder().url(url).get().post(body);
            initHeader(requestBuild, headers);
            requestBuild.addHeader(HttpHeaders.CONNECTION,"close");
            return okHttpClient.newCall(requestBuild.build()).execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Response doGetByProxy(String url, JSONObject headers, String ip) {
        return doGetByProxy(url, headers, ip, null, null);
    }

    public static Response doPostByProxy(String url, JSONObject requestBody, String contentType, JSONObject headers, String ip) {
        return doPostByProxy(url, requestBody, contentType, headers, ip, null, null);
    }

    public static Response doGetByProxy(final String url, JSONObject headers, String ip, String userName, String password) {
        try {
            String[] host = ip.split(":");
            String hostName = host[0];
            int port = Integer.valueOf(host[1]);
            Request.Builder requestBuild = new Request.Builder().url(url).get();
            initHeader(requestBuild, headers);
            requestBuild.addHeader("Connection", "close");
            Request request = requestBuild.build();
            Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(hostName, port));
            OkHttpClient okHttpClient = getOkHttpClientBuilder(proxy, userName, password).build();
            return okHttpClient.newCall(request).execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Response doPostByProxy(final String url, JSONObject requestBody, String contentType, JSONObject headers, String ip, String userName, String password) {
        try {
            String[] host = ip.split(":");
            String hostName = host[0];
            int port = Integer.valueOf(host[1]);
            RequestBody body = getRequestBody(requestBody, contentType);
            Request.Builder requestBuild = new Request.Builder().url(url).get().post(body);
            initHeader(requestBuild, headers);
            requestBuild.addHeader("Connection", "close");
            Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(hostName, port));
            OkHttpClient okHttpClient = getOkHttpClientBuilder(proxy, userName, password).build();
            return okHttpClient.newCall(requestBuild.build()).execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Response doStreamByProxy(final String url, byte[] bytes, String contentType, JSONObject headers) {
        return doStreamByProxy(url, bytes, contentType, headers, null, null, null);
    }

    public static Response doStreamByProxy(final String url, byte[] bytes, String contentType, JSONObject headers, String ip) {
        return doStreamByProxy(url, bytes, contentType, headers, ip, null, null);
    }

    public static Response doStreamByProxy(final String url, byte[] bytes, String contentType, JSONObject headers, String ip, String userName, String password) {
        try {
            RequestBody requestBody = RequestBody.create(MediaType.parse(contentType), bytes);
            Request.Builder requestBuild = new Request.Builder().url(url).get().post(requestBody);
            initHeader(requestBuild, headers);
            requestBuild.addHeader("Connection", "close");
            OkHttpClient okHttpClient = null;
            if (StringUtils.isNotBlank(ip)) {
                String[] host = ip.split(":");
                String hostName = host[0];
                int port = Integer.valueOf(host[1]);
                Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(hostName, port));
                okHttpClient = getOkHttpClientBuilder(proxy, userName, password).build();
            } else {
                okHttpClient = new OkHttpClient.Builder()
                        .retryOnConnectionFailure(true)
                        .connectTimeout(60, TimeUnit.SECONDS) //连接超时
                        .readTimeout(60, TimeUnit.SECONDS) //读取超时
                        .writeTimeout(60, TimeUnit.SECONDS).build();
            }
            return okHttpClient.newCall(requestBuild.build()).execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static OkHttpClient getProxyClient(String ip){
        String[] host = ip.split(":");
        String hostName = host[0];
        int port = Integer.valueOf(host[1]);
        Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(hostName, port));
        return getOkHttpClientBuilder(proxy, null, null).build();
    }

    public static Response doStream(final String url, byte[] bytes, String contentType, JSONObject headers) {
        try {
            RequestBody requestBody = RequestBody.create(MediaType.parse(contentType), bytes);
            Request.Builder requestBuild = new Request.Builder().url(url).get().post(requestBody);
            initHeader(requestBuild, headers);
            requestBuild.addHeader("Connection", "close");
            OkHttpClient okHttpClient = null;
            okHttpClient = new OkHttpClient.Builder()
                    .retryOnConnectionFailure(true)
                    .connectTimeout(60, TimeUnit.SECONDS) //连接超时
                    .readTimeout(60, TimeUnit.SECONDS) //读取超时
                    .writeTimeout(60, TimeUnit.SECONDS).build();
            return okHttpClient.newCall(requestBuild.build()).execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static void doAsyncGet(final String url, JSONObject headers) {
        Request.Builder requestBuild = new Request.Builder().url(url).get();
        initHeader(requestBuild, headers);
        Request request = requestBuild.build();
        okHttpClient.newCall(request).enqueue(new Callback() {

            @Override
            public void onFailure(Call call, IOException e) {
                log.error("douyin onFailure : ", e);
            }

            @Override
            public void onResponse(okhttp3.Call call, Response response) throws IOException {
                String result = response.body().string();
                log.info("dy get url : {}", url);
                log.info("dy get result : {} ", result);
                response.close();
            }
        });
    }


    public static void doAsyncProxyGet(String url, JSONObject headers, String ip, Callback callBack) {
        Request.Builder requestBuild = new Request.Builder().url(url).get();
        initHeader(requestBuild, headers);
        Request request = requestBuild.build();
        String[] host = ip.split(":");
        String hostName = host[0];
        int port = Integer.valueOf(host[1]);
        Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(hostName, port));
        OkHttpClient okHttpClient = getOkHttpClientBuilder(proxy, null, null).build();
        okHttpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(okhttp3.Call call, IOException e) {
                log.error("ip {} onFailure : ", e);
            }

            @Override
            public void onResponse(okhttp3.Call call, Response response) throws IOException {
                String result = response.body().string();
                log.info("dy post url : {}", url);
                log.info("dy post result : {} ", result);
                response.close();
            }

        });
    }

    public static void doAsyncProxyPost(String url, JSONObject requestBody, String contentType, JSONObject headers, String ip) {
        String[] host = ip.split(":");
        String hostName = host[0];
        int port = Integer.valueOf(host[1]);
        RequestBody body = getRequestBody(requestBody, contentType);
        Request.Builder requestBuild = new Request.Builder().url(url).get().post(body);
        initHeader(requestBuild, headers);
        requestBuild.addHeader("Connection", "close");
        Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(hostName, port));
        OkHttpClient okHttpClient = getOkHttpClientBuilder(proxy, null, null).build();
        okHttpClient.newCall(requestBuild.build()).enqueue(new Callback() {
            @Override
            public void onFailure(okhttp3.Call call, IOException e) {
                log.error("douyin onFailure : ", e);
            }

            @Override
            public void onResponse(okhttp3.Call call, Response response) throws IOException {
                String result = response.body().string();
                log.info("dy post url : {}", url);
                log.info("dy post result : {} ", result);
                response.close();
            }

        });
    }

    private static void initHeader(Request.Builder requestBuild, JSONObject headers) {
        if (headers == null) {
            return;
        }
        Set<Map.Entry<String, Object>> set = headers.entrySet();
        for (Map.Entry<String, Object> entry : set) {
            String key = entry.getKey();
            Object value = entry.getValue();
            if (value == null) {
                value = "";
            }
            requestBuild.addHeader(key, value.toString());
        }
    }

    private static RequestBody getRequestBody(JSONObject requestBody, String contentType) {
        if (!contentType.contains("x-www-form-urlencoded")) {
            MediaType JSON = buildMediaType(contentType);
            return RequestBody.create(JSON, requestBody.toJSONString());
        }
        FormBody.Builder formBody = new FormBody.Builder();
        for (Map.Entry<String, Object> entry : requestBody.entrySet()) {
            Object value = entry.getValue();
            if (value == null) {
                value = "";
            }
            formBody.add(entry.getKey(), value.toString());
        }
        return formBody.build();
    }

    private static RequestBody getRequestBody(JSONArray jsonArray) {
        MediaType JSON = OkHttpUtils.JSON;
        return RequestBody.create(JSON, jsonArray.toJSONString());
    }

    public static void doAsyncPost(final String url, JSONObject requestBody, String contentType, JSONObject headers) {
        RequestBody body = getRequestBody(requestBody, contentType);
        Request.Builder requestBuild = new Request.Builder().url(url).get().post(body);
        initHeader(requestBuild, headers);
        okHttpClient.newCall(requestBuild.build()).enqueue(new Callback() {
            @Override
            public void onFailure(okhttp3.Call call, IOException e) {
                log.error("douyin onFailure : ", e);
            }

            @Override
            public void onResponse(okhttp3.Call call, Response response) throws IOException {
                String result = response.body().string();
                log.info("dy post url : {}", url);
                log.info("dy post result : {} ", result);
                response.close();
            }

        });
    }

    public static JSONObject sign(String signRequestUrl, String url, String cookie, String xtToken) {
        Response response = null;
        try {
            JSONObject requestBody = new JSONObject();
            requestBody.put("url", url);
            requestBody.put("method", "post");
            JSONObject headers = new JSONObject();
            headers.put("source", "blade");
            headers.put("dycookie", cookie);
            headers.put("dytoken", xtToken);
            RequestBody body = RequestBody.create(JSON, requestBody.toJSONString());
            Request.Builder requestBuild = new Request.Builder().url(signRequestUrl).get().post(body);
            initHeader(requestBuild, headers);
            response = okHttpClient.newCall(requestBuild.build()).execute();
            return JSONObject.parseObject(response.body().string());
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }

    public static JSONObject signStream(String signRequestUrl, String url, String content, String cookie, String xtToken, String type) {
        Response response = null;
        try {
            JSONObject requestBody = new JSONObject();
            requestBody.put("url", url);
            requestBody.put("method", "post");
            requestBody.put("stream", type);
            requestBody.put("encodeStream", content);
            JSONObject headers = new JSONObject();
            headers.put("source", "blade");
            headers.put("dycookie", cookie);
            headers.put("dytoken", xtToken);
            RequestBody body = RequestBody.create(JSON, requestBody.toJSONString());
            Request.Builder requestBuild = new Request.Builder().url(signRequestUrl).get().post(body);
            initHeader(requestBuild, headers);
            response = okHttpClient.newCall(requestBuild.build()).execute();
            return JSONObject.parseObject(response.body().string());
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }

    public static JSONObject signDecodeStream(String signRequestUrl, String url, byte[] content, String cookie, String xtToken, String type) {
        Response response = null;
        try {
            JSONObject requestBody = new JSONObject();
            requestBody.put("url", url);
            requestBody.put("method", "post");
            requestBody.put("stream", "decodeStream");
            requestBody.put("decodeStream", content);
            JSONObject headers = new JSONObject();
            headers.put("source", "blade");
            headers.put("dycookie", cookie);
            headers.put("dytoken", xtToken);
            RequestBody body = RequestBody.create(JSON, requestBody.toJSONString());
            Request.Builder requestBuild = new Request.Builder().url(signRequestUrl).get().post(body);
            initHeader(requestBuild, headers);
            response = okHttpClient.newCall(requestBuild.build()).execute();
            return JSONObject.parseObject(response.body().string());
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }

    public static JSONObject sign(String signRequestUrl, JSONObject requestBody, JSONObject headers) {
        Response response = null;
        try {
            RequestBody body = RequestBody.create(JSON, requestBody.toJSONString());
            Request.Builder requestBuild = new Request.Builder().url(signRequestUrl).get().post(body);
            initHeader(requestBuild, headers);
            response = okHttpClient.newCall(requestBuild.build()).execute();
            return JSONObject.parseObject(response.body().string());
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }

    private static MediaType buildMediaType(String contentType) {
        if (contentType == null || "".equals(contentType)) {
            return JSON;
        }
        return MediaType.parse(contentType);
    }

    public static Response uploadImage(String url, String fileKey, String fileName, File file, JSONObject jsonObject, JSONObject headers) {
        try {
            MultipartBody.Builder builder = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM);

            if (jsonObject != null) {
                Set<Map.Entry<String, Object>> set = jsonObject.entrySet();
                for (Map.Entry<String, Object> entry : set) {
                    Object value = entry.getValue();
                    if (value == null) {
                        value = "";
                    }
                    builder.addFormDataPart(entry.getKey(), value.toString());
                }
            }
            builder.addFormDataPart(fileKey, fileName, RequestBody.create(MediaType.parse("application/octet-stream"), file));
            RequestBody requestBody = builder.build();
            Request.Builder requestBuild = new Request.Builder()
                    .url(url)
                    .post(requestBody);
            initHeader(requestBuild, headers);
            return okHttpClient.newCall(requestBuild.build()).execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Response uploadImage(String url, String digist, File file, JSONObject jsonObject, JSONObject headers) {
        try {
            MultipartBody.Builder builder = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM);

            if (jsonObject != null) {
                Set<Map.Entry<String, Object>> set = jsonObject.entrySet();
                for (Map.Entry<String, Object> entry : set) {
                    Object value = entry.getValue();
                    if (value == null) {
                        value = "";
                    }
                    builder.addFormDataPart(entry.getKey(), value.toString());
                }
            }
            builder.addFormDataPart("file", "head.data", RequestBody.create(MediaType.parse("application/octet-stream"), file));
            if (StringUtils.isNotBlank(digist)) {
                builder.addFormDataPart("md5", digist);
            }
            RequestBody requestBody = builder.build();
            Request.Builder requestBuild = new Request.Builder()
                    .url(url)
                    .post(requestBody);
            initHeader(requestBuild, headers);
            return okHttpClient.newCall(requestBuild.build()).execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Response uploadImageByProxy(String url, String digist, File file, JSONObject jsonObject, JSONObject headers, String ip) {
        try {
            String[] host = ip.split(":");
            String hostName = host[0];
            int port = Integer.valueOf(host[1]);
            Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(hostName, port));
            OkHttpClient okHttpClient = getOkHttpClientBuilder(proxy, null, null).build();
            MultipartBody.Builder builder = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM);
            if (jsonObject != null) {
                Set<Map.Entry<String, Object>> set = jsonObject.entrySet();
                for (Map.Entry<String, Object> entry : set) {
                    Object value = entry.getValue();
                    if (value == null) {
                        value = "";
                    }
                    builder.addFormDataPart(entry.getKey(), value.toString());
                }
            }
            builder.addFormDataPart("file", "head.data", RequestBody.create(MediaType.parse("application/octet-stream"), file));
            if (StringUtils.isNotBlank(digist)) {
                builder.addFormDataPart("md5", digist);
            }
            RequestBody requestBody = builder.build();
            Request.Builder requestBuild = new Request.Builder()
                    .url(url)
                    .post(requestBody);
            initHeader(requestBuild, headers);
            return okHttpClient.newCall(requestBuild.build()).execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    private static RequestBody buildImageRequestBody(final MediaType mediaType, final File file) {
        return new RequestBody() {
            public MediaType contentType() {
                return mediaType;
            }

            public long contentLength() {
                return file.length();
            }

            public void writeTo(BufferedSink bufferedSink) {
                try {
                    Source source = Okio.source(file);
                    Buffer buffer = new Buffer();
                    long j = 0;
                    while (true) {
                        long read = source.read(buffer, 2048);
                        if (read != -1) {
                            bufferedSink.write(buffer, read);
                            j += read;
                        } else {
                            bufferedSink.flush();
                            return;
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        };
    }

    public static boolean downloadPic(String picUrl, String localFileName) {
        final File file = new File(localFileName);
        if (file.exists()) {
            file.delete();
        } else {
            try {
                file.createNewFile();
            } catch (IOException e) {
                log.error("create file failed, file = " + file.getAbsolutePath(), e);
            }
        }

        InputStream is = null;
        FileOutputStream fos = null;

        try {
            Request request = new Request.Builder().url(picUrl).build();
            Call call = okHttpClient.newCall(request);
            Response response = call.execute();
            byte[] buf = new byte[2048];
            int len = 0;
            is = response.body().byteStream();
            fos = new FileOutputStream(file);
            while ((len = is.read(buf)) != -1) {
                fos.write(buf, 0, len);
            }
            fos.flush();
            return true;
        } catch (IOException e) {
            log.error("download failed", e);
            return false;
        } finally {
            try {
                if (is != null) {
                    is.close();
                }
                if (fos != null) {
                    fos.close();
                }
            } catch (IOException e) {
                log.error("down loaded failed", e);
            }
        }
    }

}
