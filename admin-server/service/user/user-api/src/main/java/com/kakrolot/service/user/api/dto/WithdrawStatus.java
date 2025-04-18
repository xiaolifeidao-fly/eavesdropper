package com.kakrolot.service.user.api.dto;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;

@Getter
public enum WithdrawStatus {

    UN_APPROVE("待审核","审核中"),
    APPROVING("审核中","审核中"),
    ERROR("提现失败","提现失败"),
    CANCEL("取消成功",""),
    CANCELING("取消中",""),
    ACCOUNTING("结算中","结算中"),
    UN_FINISH("待完成",""),
    FINISH("提现成功","提现完成");

    private String name;

    private String kakaName;

    WithdrawStatus(String name, String kakaName) {
        this.name = name;
        this.kakaName = kakaName;
    }

    //审核中
    public static List<String> APPROVING_LIST = Arrays.asList(UN_APPROVE.name(), APPROVING.name());

    //结算中
    public static List<String> ACCOUNTING_LIST = Arrays.asList(ACCOUNTING.name());

    //提现完成
    public static List<String> FINISH_LIST = Arrays.asList(FINISH.name());

    //提现失败
    public static List<String> ERROR_LIST = Arrays.asList(ERROR.name());
}
