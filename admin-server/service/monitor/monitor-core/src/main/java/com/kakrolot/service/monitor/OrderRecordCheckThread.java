package com.kakrolot.service.monitor;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.service.monitor.util.SmsSendUtil;
import com.kakrolot.service.order.api.OrderRecordService;
import com.kakrolot.service.order.api.dto.OrderStatus;
import com.kakrolot.service.shop.api.ShopService;
import com.kakrolot.service.shop.api.dto.BusinessType;
import com.kakrolot.service.shop.api.dto.ShopDTO;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by roc_peng on 2020/9/2.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Slf4j
public class OrderRecordCheckThread extends Thread {

    private OrderRecordService orderRecordService;

    private ShopService shopService;

    private static final String signName = "集卡团";
    private static final String templateCode = "SMS_201450434";
    private static final String phoneNumbers = "18817353729,17796806633,15517782555,18653639334,18217637991,15021348281";
    private static final String templateParam = "{\"code\":\"8888\"}";


    public OrderRecordCheckThread(OrderRecordService orderRecordService, ShopService shopService) {
        this.orderRecordService = orderRecordService;
        this.shopService = shopService;
    }

    @SneakyThrows
    @Override
    public void run() {
        while(true){
            List<Long> dyFollowShopIds = shopService.findAllByBusinessType(BusinessType.BATCH_FOLLOW.name())
                    .stream().map(ShopDTO::getId).collect(Collectors.toList());
            Long dyFollowWaitCounts = orderRecordService.countByOrderStatusInAndShopIdIn(Collections.singletonList(OrderStatus.INIT.name()), dyFollowShopIds);
            List<Long> dyLoveShopIds = shopService.findAllByBusinessType(BusinessType.BATCH_LOVE.name())
                    .stream().map(ShopDTO::getId).collect(Collectors.toList());
            Long dyLoveWaitCounts = orderRecordService.countByOrderStatusInAndShopIdIn(Collections.singletonList(OrderStatus.INIT.name()), dyLoveShopIds);
            if(dyFollowWaitCounts+dyLoveWaitCounts<100) {
                log.info("order-init-check-success,关注 is {},点赞 is {}",dyFollowWaitCounts,dyLoveWaitCounts);
                Thread.sleep(60000);
            } else {
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("code",dyFollowWaitCounts+dyLoveWaitCounts);
                String response = SmsSendUtil.sendSms(signName, templateCode, phoneNumbers, jsonObject.toJSONString());
                log.info("order-init-check-error,关注 is {},点赞 is {},response is {}",dyFollowWaitCounts,dyLoveWaitCounts,response);
                Thread.sleep(60000 * 10);
            }
        }
    }
}
