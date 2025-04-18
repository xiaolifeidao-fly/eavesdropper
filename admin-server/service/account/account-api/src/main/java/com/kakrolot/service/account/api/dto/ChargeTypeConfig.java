package com.kakrolot.service.account.api.dto;

import com.kakrolot.service.dictionary.dto.DictionaryConfig;
import lombok.Getter;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Getter
public enum ChargeTypeConfig {

    DY_LOVE(1, DictionaryConfig.DY_LOVE_PRICE.name(), Arrays.asList("BATCH_LOVE", "BATCH_RG_LOVE")),
    DY_LOW_LOVE(1, DictionaryConfig.DY_LOW_LOVE_PRICE.name(), Collections.singletonList("BATCH_LOW_LOVE")),
    DY_FOLLOW(2, DictionaryConfig.DY_FOLLOW_PRICE.name(), Collections.singletonList("BATCH_FOLLOW"));

    private int settleDay;

    private List<String> types;

    private String priceCode;


    ChargeTypeConfig(int settleDay, String priceCode, List<String> types) {
        this.settleDay = settleDay;
        this.priceCode = priceCode;
        this.types = types;
    }

}
