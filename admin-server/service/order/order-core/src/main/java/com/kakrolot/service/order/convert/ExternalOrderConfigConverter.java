package com.kakrolot.service.order.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.order.api.dto.ExternalOrderConfigDTO;
import com.kakrolot.service.order.dao.po.ExternalOrderConfig;
import org.springframework.stereotype.Component;

@Component
public class ExternalOrderConfigConverter extends CommonConvert<ExternalOrderConfigDTO, ExternalOrderConfig> {
}
