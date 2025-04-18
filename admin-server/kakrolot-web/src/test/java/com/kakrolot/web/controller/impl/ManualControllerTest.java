package com.kakrolot.web.controller.impl;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.service.shop.api.dto.ManualShopCategoryDTO;
import okhttp3.Response;

import java.util.ArrayList;
import java.util.List;

/**
 * OrderController Tester.
 *
 * @author <Authors name>
 * @version 1.0
 * @since <pre>5月 1, 2020</pre>
 */
public class ManualControllerTest {

    public static void main(String[] args) throws Exception {
        String url = "http://localhost:9999/shops/shopCategories";
        Response response = null;
        List<ManualShopCategoryDTO> shopDTOList = new ArrayList<>();
        response = OkHttpUtils.doGetLongTimeout(url, new JSONObject());
        String result = response.body().string();
        JSONObject jsonObject = JSONObject.parseObject(result);
        String data = jsonObject.getString("data");

        List<ManualShopCategoryDTO> manualShopCategoryDTOS = JSONObject.parseArray(data, ManualShopCategoryDTO.class);
        System.out.println(manualShopCategoryDTOS);
    }

} 
