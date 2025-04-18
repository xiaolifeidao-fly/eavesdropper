package com.kakrolot.service.order.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.order.dao.po.ExternalOrderConfig;

public interface ExternalOrderConfigRepository extends CommonRepository<ExternalOrderConfig, Long> {

    ExternalOrderConfig getById(Long id);

    ExternalOrderConfig findByChannel(String channel);
}

