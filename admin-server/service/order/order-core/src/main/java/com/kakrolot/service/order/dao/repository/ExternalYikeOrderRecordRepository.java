package com.kakrolot.service.order.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.order.dao.po.ExternalYikeOrderRecord;

public interface ExternalYikeOrderRecordRepository extends CommonRepository<ExternalYikeOrderRecord, Long> {

    ExternalYikeOrderRecord getById(Long id);

    ExternalYikeOrderRecord findByChannelAndExternalOrderId(String channel, String externalOrderId);

}

