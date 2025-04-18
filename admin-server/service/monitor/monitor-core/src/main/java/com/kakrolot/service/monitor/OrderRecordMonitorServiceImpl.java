package com.kakrolot.service.monitor;

import com.kakrolot.service.monitor.api.OrderRecordMonitorService;
import com.kakrolot.service.order.api.OrderRecordService;
import com.kakrolot.service.shop.api.ShopService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Created by roc_peng on 2020/9/2.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Service
@Slf4j
public class OrderRecordMonitorServiceImpl implements OrderRecordMonitorService, InitializingBean {

    @Value("${order.init.monitor:false}")
    private Boolean orderMonitor;

    @Autowired
    private OrderRecordService orderRecordService;

    @Autowired
    private ShopService shopService;

    @Override
    public void afterPropertiesSet() throws Exception {
        if(orderMonitor) {
            new OrderRecordCheckThread(orderRecordService,shopService).start();
        }
    }
}
