package com.kakrolot.service.dictionary.dto;

import com.alibaba.fastjson.annotation.JSONField;
import lombok.Getter;

/**
 * @author xiaofeidao
 * @date 2019/6/3
 */
@Getter
public enum DictionaryConfig {

    ORDER_SLAVER_CONFIG("订单服务配置"),
    DY_LOVE_PRICE("dy-love-单价"),
    DY_LOW_LOVE_PRICE("dy-love-单价"),
    DY_FOLLOW_PRICE("dy-follow-单价");

    private String desc;

    DictionaryConfig(String desc){
        this.desc = desc;
    }

}
