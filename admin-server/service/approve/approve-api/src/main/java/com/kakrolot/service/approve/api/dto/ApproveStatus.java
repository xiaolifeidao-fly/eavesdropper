package com.kakrolot.service.approve.api.dto;

/**
 * Created by roc_peng on 2020/7/4.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */

public enum ApproveStatus {

    //审核中
    CHECKING("审核中"),
    //审核完成
    FINISH("审核完成");

    private String desc;

    public String getDesc() {
        return desc;
    }
    ApproveStatus(String desc){
        this.desc = desc;
    }

}
