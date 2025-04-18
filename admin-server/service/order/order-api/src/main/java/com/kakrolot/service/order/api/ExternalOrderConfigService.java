package com.kakrolot.service.order.api;

import com.kakrolot.service.order.api.dto.ExternalOrderConfigDTO;

public interface ExternalOrderConfigService {

    ExternalOrderConfigDTO getByChannel(String channel);
    
}
