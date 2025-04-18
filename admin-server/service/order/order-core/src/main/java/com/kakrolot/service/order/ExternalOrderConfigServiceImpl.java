package com.kakrolot.service.order;

import com.kakrolot.service.order.api.ExternalOrderConfigService;
import com.kakrolot.service.order.api.dto.ExternalOrderConfigDTO;
import com.kakrolot.service.order.convert.ExternalOrderConfigConverter;
import com.kakrolot.service.order.dao.repository.ExternalOrderConfigRepository;
import com.kakrolot.service.order.dao.po.ExternalOrderConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ExternalOrderConfigServiceImpl implements ExternalOrderConfigService {
    
    @Autowired
    private ExternalOrderConfigRepository externalOrderConfigRepository;
    
    @Autowired
    private ExternalOrderConfigConverter externalOrderConfigConverter;
    
    @Override
    public ExternalOrderConfigDTO getByChannel(String channel) {
        ExternalOrderConfig config = externalOrderConfigRepository.findByChannel(channel);
        return externalOrderConfigConverter.toDTO(config);
    }
}
