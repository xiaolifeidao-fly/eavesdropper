package com.kakrolot.service.order.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.order.api.dto.OrderRefundRecordDTO;
import com.kakrolot.service.order.dao.po.OrderRefundRecord;
import org.springframework.stereotype.Component;

@Component
public class OrderRefundRecordConverter extends CommonConvert<OrderRefundRecordDTO, OrderRefundRecord> {
}
