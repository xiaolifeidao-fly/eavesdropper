package com.kakrolot.service.order.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.order.api.dto.OrderRecordExtParamDTO;
import com.kakrolot.service.order.dao.po.OrderRecordExtParam;
import org.springframework.stereotype.Component;

@Component
public class OrderRecordExtParamConverter extends CommonConvert<OrderRecordExtParamDTO, OrderRecordExtParam> {
}
