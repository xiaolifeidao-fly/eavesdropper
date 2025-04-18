package com.kakrolot.service.approve.api.dto;

public enum UserApproveStatus {

    ERROR,
    WAIT,
    DONE;

    public static UserApproveStatus getEnumByName(String name) {
        for(UserApproveStatus userApproveStatus : UserApproveStatus.values()){
            if(userApproveStatus.name().equals(name)) {
                return userApproveStatus;
            }
        }
        return ERROR;
    }

}
