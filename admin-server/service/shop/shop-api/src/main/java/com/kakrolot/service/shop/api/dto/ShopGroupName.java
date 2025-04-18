package com.kakrolot.service.shop.api.dto;

import lombok.Getter;

@Getter
public enum ShopGroupName {

    XHS("小红薯"),
    DY("电音"),
    LOW_XHS("小红薯");

    private String desc;

    ShopGroupName(String desc){
        this.desc = desc;
    }

}
