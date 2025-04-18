package com.kakrolot.service.user.api.dto;

/**
 * Created by caoti on 2021/8/14.
 */

public enum ChannelDetailType {

    MERCHANT("工作室"),
    RETAILER("散户");

    private String desc;

    ChannelDetailType(String desc) {
        this.desc = desc;
    }

    public String getDesc() {
        return desc;
    }
}
