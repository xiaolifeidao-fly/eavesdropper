package com.kakrolot.service.order.api.dto;

import lombok.Getter;

@Getter
public enum OrderStatus {

    INIT_ING("初始化中", 0),
    INIT("未开始", 1),
    PENDING("进行中", 2),
    DONE("已完成", 100),
    ERROR("处理失败", 100),
    REFUND_PENDING("退单中", 10),
    REFUND_HANDING("退单处理中", 11),
    REFUND_FAILED("退单失败", 12),
    REFUND_SUCCESS("退单成功", 13);

    private String desc;

    private Integer index;

    OrderStatus(String desc, Integer index) {
        this.desc = desc;
        this.index = index;
    }

    public static OrderStatus getOrderStatusByDesc(String desc) {
        for(OrderStatus orderStatus : OrderStatus.values()) {
            if(desc.equals(orderStatus.getDesc())){
                return orderStatus;
            }
        }
        return INIT_ING;
    }

}
