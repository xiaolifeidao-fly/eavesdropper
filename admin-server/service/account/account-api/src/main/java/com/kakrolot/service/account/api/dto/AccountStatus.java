package com.kakrolot.service.account.api.dto;

import lombok.Getter;

@Getter
public enum AccountStatus {

    ACTIVE("正常"),
    EXPIRE("失效"),
    BLOCK("冻结"),
    ERROR("未知异常");
    private String desc;

    AccountStatus(String desc){
        this.desc = desc;
    }

    public static String getDescByName(String name) {
        for(AccountStatus accountStatus : AccountStatus.values()){
            if(accountStatus.name().equals(name)) {
                return accountStatus.getDesc();
            }
        }
        return ERROR.getDesc();
    }

}
