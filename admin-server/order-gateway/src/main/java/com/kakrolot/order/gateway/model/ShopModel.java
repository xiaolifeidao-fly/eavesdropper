package com.kakrolot.order.gateway.model;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ShopModel {

    private BigDecimal price;

    private String name;

    private Long upperLimit;

    private Long lowerLimit;

}
