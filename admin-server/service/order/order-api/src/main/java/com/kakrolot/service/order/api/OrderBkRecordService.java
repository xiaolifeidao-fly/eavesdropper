package com.kakrolot.service.order.api;

import com.kakrolot.service.order.api.dto.OrderBkRecordDTO;

public interface OrderBkRecordService {

    void save(OrderBkRecordDTO orderBkRecordDTO);

    OrderBkRecordDTO findByOrderId(Long id);
}
