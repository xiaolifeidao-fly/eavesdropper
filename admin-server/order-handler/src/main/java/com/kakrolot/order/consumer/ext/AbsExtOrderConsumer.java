package com.kakrolot.order.consumer.ext;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.business.service.order.OrderQueue;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.redis.queues.RedisQueueConsumer;
import com.kakrolot.service.order.api.OrderRecordService;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.shop.api.ShopCategoryService;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class AbsExtOrderConsumer extends RedisQueueConsumer<JSONObject> {

    @Autowired
    protected OrderRecordService orderRecordService;

    @Autowired
    protected ShopCategoryService shopCategoryService;

    @Autowired
    protected OrderQueue orderQueue;

    protected OrderEntity getOrderEntity(JSONObject message, Long id, OrderRecordDTO orderRecordDTO, String orderStatus) {
        Long startNum = message.getLong("startNum");
        Long endNum = message.getLong("endNum");
        OrderEntity orderEntity = new OrderEntity();
        orderEntity.setId(id);
        orderEntity.setEndNum(endNum);
        orderEntity.setInitNum(startNum);
        orderEntity.setOperator(orderRecordDTO.getUserName());
        orderEntity.setOrderStatus(orderStatus);
        orderEntity.setUserName(orderRecordDTO.getUserName());
        orderEntity.setUserId(orderRecordDTO.getUserId());
        return orderEntity;
    }
}
