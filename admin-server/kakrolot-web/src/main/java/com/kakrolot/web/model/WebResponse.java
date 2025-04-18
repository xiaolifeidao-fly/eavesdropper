package com.kakrolot.web.model;

import com.kakrolot.business.service.response.Response;
import com.kakrolot.web.auth.AuthType;
import lombok.Data;

/**
 * @author xianglong
 * @date 2019/7/28
 */
@Data
public class WebResponse<T> {

    private String code;

    private T data;

    private String message;

    private String authType;


    public static WebResponse<Object> response(Response response) {
        WebResponse<Object> webResponse = new WebResponse<>();
        webResponse.setCode(response.getCode());
        webResponse.setMessage(response.getMessage());
        webResponse.setData(response.getData());
        webResponse.setAuthType(AuthType.ALLOW.name());
        return webResponse;
    }

    public static <T> WebResponse<T> success(T data) {
        WebResponse<T> webResponse = new WebResponse<>();
        webResponse.setCode("0");
        webResponse.setData(data);
        webResponse.setMessage("操作成功");
        webResponse.setAuthType(AuthType.ALLOW.name());
        return webResponse;
    }

    public static <T> WebResponse<T> successMessage(String message) {
        WebResponse<T> webResponse = new WebResponse<>();
        webResponse.setCode("0");
        webResponse.setMessage(message);
        webResponse.setAuthType(AuthType.ALLOW.name());
        return webResponse;
    }

    public static <T> WebResponse<T> error(String message) {
        WebResponse<T> webResponse = new WebResponse<>();
        webResponse.setCode("1");
        webResponse.setMessage(message);
        webResponse.setAuthType(AuthType.ALLOW.name());
        return webResponse;
    }

    public static <T> WebResponse<T> error(String message, AuthType authType) {
        WebResponse<T> webResponse = new WebResponse<>();
        webResponse.setCode("1");
        webResponse.setMessage(message);
        webResponse.setAuthType(authType.name());
        return webResponse;
    }

    public static <T> WebResponse<T> error(String code, String message, AuthType authType) {
        WebResponse<T> webResponse = new WebResponse<>();
        webResponse.setCode(code);
        webResponse.setMessage(message);
        webResponse.setAuthType(authType.name());
        return webResponse;
    }

}
