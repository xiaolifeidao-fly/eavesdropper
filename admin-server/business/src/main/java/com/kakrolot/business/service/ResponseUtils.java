package com.kakrolot.business.service;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.business.service.response.Response;
import org.apache.commons.lang3.StringUtils;

public class ResponseUtils {

    public static Response buildError(String message) {
        Response response = new Response();
        response.setCode("1");
        response.setMessage(message);
        return response;
    }

    public static Response buildSuccess(String message) {
        return buildSuccess(message, null);
    }

    public static Response buildSuccess(String message, JSONObject jsonObject) {
        Response response = new Response();
        response.setCode("0");
        response.setData(jsonObject);
        response.setMessage(message);
        return response;
    }

    public static boolean isSuccess(Response response) {
        if (StringUtils.equals("0", response.getCode())) {
            return true;
        }
        return false;
    }
}
