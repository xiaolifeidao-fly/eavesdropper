package com.kakrolot.service.account.api.dto;

import lombok.Getter;

@Getter
public enum AmountType {

    PAY("充值", 1),
    CONSUMER("消费", -1),
    DEDUCT("扣款", -1),
    REFUND("退货", 1),
    BK("补款", 1),
    GIVEN("赠送", 1);

    private String desc;

    private int price;

    AmountType(String desc, int price) {
        this.desc = desc;
        this.price = price;
    }
}
