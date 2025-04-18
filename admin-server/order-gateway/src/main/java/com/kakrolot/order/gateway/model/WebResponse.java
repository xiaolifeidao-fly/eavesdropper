package com.kakrolot.order.gateway.model;

import com.kakrolot.business.service.response.Response;
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


    public static WebResponse<Object> response(Response response) {
        WebResponse<Object> webResponse = new WebResponse<>();
        webResponse.setCode(response.getCode());
        webResponse.setMessage(response.getMessage());
        webResponse.setData(response.getData());
        return webResponse;
    }

    public static <T> WebResponse<T> success(T data) {
        WebResponse<T> webResponse = new WebResponse<>();
        webResponse.setCode("0");
        webResponse.setData(data);
        webResponse.setMessage("操作成功");
        return webResponse;
    }

    public static <T> WebResponse<T> error(String message) {
        WebResponse<T> webResponse = new WebResponse<>();
        webResponse.setCode("1");
        webResponse.setMessage(message);
        return webResponse;
    }

}
