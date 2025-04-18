package com.kakrolot.service.order.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.order.api.dto.OrderBkRecordDTO;
import com.kakrolot.service.order.dao.po.OrderBkRecord;
import org.springframework.stereotype.Component;

@Component
public class OrderBkRecordConverter extends CommonConvert<OrderBkRecordDTO, OrderBkRecord> {
}
