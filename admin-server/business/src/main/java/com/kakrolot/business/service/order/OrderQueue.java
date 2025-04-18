package com.kakrolot.business.service.order;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.redis.util.RedisUtil;
import com.kakrolot.service.dictionary.DictionaryService;
import com.kakrolot.service.dictionary.dto.DictionaryConfig;
import com.kakrolot.service.dictionary.dto.DictionaryDTO;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class OrderQueue implements InitializingBean {

    @Getter
    private List<String> slaverNames = new ArrayList<>();

    @Getter
    private Map<String, Map<String, List<String>>> slaverRangeMap = new HashMap<>();

    @Autowired
    private DictionaryService dictionaryService;

    @Autowired
    private RedisUtil redisUtil;

    private static final String ORDER_KEY_PRE = "KAKROLOT_ORDER_HANDLER_";

    private static final String PRE_SLAVE_NAME = "order_slave";

    @Override
    public void afterPropertiesSet() throws Exception {
        DictionaryDTO dictionaryDTO = dictionaryService.getByCode(DictionaryConfig.ORDER_SLAVER_CONFIG.name());
        if (dictionaryDTO == null) {
            log.error("could not found ORDER_SLAVER_CONFIG");
            throw new RuntimeException("could not found ORDER_SLAVER_CONFIG");
        }
        String value = dictionaryDTO.getValue();
        if (StringUtils.isBlank(value)) {
            log.error("could not found ORDER_SLAVER_CONFIG value");
            throw new RuntimeException("could not found ORDER_SLAVER_CONFIG value");
        }
        JSONArray jsonArray = JSONArray.parseArray(value);
        initSlaverRangeKeys(jsonArray);
    }

    private void initSlaverRangeKeys(JSONArray jsonArray) {
        try {
            for (Object json : jsonArray) {
                JSONObject jsonObject = (JSONObject) json;
                String slaveName = jsonObject.getString("slaveName");
                JSONArray slaveConfigs = jsonObject.getJSONArray("slaveConfig");
                Map<String, List<String>> map = new HashMap<>();
                for (Object slave : slaveConfigs) {
                    JSONObject slaveConfig = (JSONObject) slave;
                    String key = slaveConfig.getString("key");
                    Long num = slaveConfig.getLong("num");
                    List<String> configs = new ArrayList<>();
                    for (int index = 0; index < num; index++) {
                        String orderKey = ORDER_KEY_PRE + slaveName + "_" + key + "_" + index;
                        configs.add(orderKey);
                    }
                    map.put(key, configs);
                }
                slaverRangeMap.put(slaveName, map);
                slaverNames.add(slaveName);
            }
            log.info("initSlaverRangeKeys success");
        } catch (Exception e) {
            log.error("initSlaverRangeKeys error :", e);
            throw new RuntimeException(e);
        }
    }

    public void submit(OrderEntity orderEntity, OrderConsumerConfig orderConsumerConfig, Long userId) {
        try {
            int slaveIndex = userId.intValue() % slaverRangeMap.size();
            Map<String, List<String>> slaverConfig = slaverRangeMap.get(PRE_SLAVE_NAME + slaveIndex);
            List<String> orderKeys = slaverConfig.get(orderConsumerConfig.name());
            String key = userId + "_" + orderEntity.getId();
            int orderIndex = Math.abs(key.hashCode()) % orderKeys.size();
            String rangeKey = orderKeys.get(orderIndex);
            redisUtil.lpush(rangeKey, JSONObject.toJSONString(orderEntity));
        } catch (Exception e) {
            log.error("push order {} and {} error: {}", orderEntity, userId, e);
            throw new RuntimeException(e);
        }
    }


}
