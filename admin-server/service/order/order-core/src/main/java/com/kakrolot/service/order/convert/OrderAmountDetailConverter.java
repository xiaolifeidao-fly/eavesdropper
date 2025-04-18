package com.kakrolot.service.order.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.order.api.dto.OrderAmountDetailDTO;
import com.kakrolot.service.order.dao.po.OrderAmountDetail;
import org.springframework.stereotype.Component;

@Component
public class OrderAmountDetailConverter extends CommonConvert<OrderAmountDetailDTO, OrderAmountDetail> {
}
