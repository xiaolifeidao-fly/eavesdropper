package com.kakrolot.service.user;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.service.user.api.UserDetailService;
import com.kakrolot.service.user.api.dto.UserDetailDTO;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Created by caoti on 2021/8/5.
 */
@Service
@Slf4j
public class UserDetailServiceImpl implements UserDetailService {

    @Value("${barry.url.inner.prefix:http://127.0.0.1:9999}")
    private String barryInnerPrefix;

    @Value("${barry.url.inner.user.detail.find.suffix:/user/detail?username={username}}")
    private String userDetailFindSuffix;

    @Value("${barry.url.inner.user.detail.save.suffix:/user/detail/save}")
    private String userDetailSaveSuffix;

    @Value("${barry.url.inner.user.detail.update.suffix:/user/detail/update}")
    private String userDetailUpdateSuffix;


    @Override
    public UserDetailDTO findByUserName(String username) {
        String url = barryInnerPrefix + userDetailFindSuffix;
        url = url.replace("{username}", username);
        Response response = null;
        UserDetailDTO userDetailDTO = null;
        try {
            response = OkHttpUtils.doGetLongTimeout(url, new JSONObject());
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            String data = jsonObject.getString("data");
            if (StringUtils.isNotBlank(data)) {
                userDetailDTO = JSONObject.parseObject(data, UserDetailDTO.class);
            }
        } catch (Exception e) {
            log.error("findByUserName-error,e is {}", e.toString());
        }
        return userDetailDTO;
    }

    @Override
    public void saveUserDetail(UserDetailDTO userDetailDTO) {
        String url = barryInnerPrefix + userDetailSaveSuffix;
        try {
            OkHttpUtils.doPost(url, (JSONObject) JSONObject.toJSON(userDetailDTO), "application/json", null);
        } catch (Exception e) {
            log.error("saveUserDetail-error,e is {}", e.toString());
        }
    }

    @Override
    public void updateUserDetail(UserDetailDTO userDetailDTO) {
        String url = barryInnerPrefix + userDetailUpdateSuffix;
        try {
            OkHttpUtils.doPost(url, (JSONObject) JSONObject.toJSON(userDetailDTO), "application/json", null);
        } catch (Exception e) {
            log.error("updateUserDetail-error,e is {}", e.toString());
        }
    }
}
