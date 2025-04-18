package com.kakrolot.web.util;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Created by roc_peng on 2020/7/9.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Slf4j
@Component
public class XhsQueryUtils {

    public JSONObject getNoteDetailFromWebApi(String businessId) {
        JSONObject noteDetail = null;
        okhttp3.Response response = null;
        try {
            String url = "https://www.xiaohongshu.com/fe_api/burdock/v1/note/" + businessId;
            response = OkHttpUtils.doGet(url, null);
            String result = response.body().string();
            noteDetail = JSONObject.parseObject(result).getJSONObject("data");
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
        return noteDetail;
    }

}
