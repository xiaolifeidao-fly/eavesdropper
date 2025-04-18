package com.kakrolot.business.service.response;

import com.alibaba.fastjson.JSONObject;
import lombok.Data;

@Data
public class Response {

    protected String code;

    protected String message;

    protected JSONObject data;
}
