package com.kakrolot.service.order.api;

import com.kakrolot.service.order.api.dto.ExternalYikeOrderRecordDTO;

public interface ExternalYikeOrderRecordService {

    ExternalYikeOrderRecordDTO getByChannelAndExternalOrderId(String channel, String externalOrderId);

    ExternalYikeOrderRecordDTO save(ExternalYikeOrderRecordDTO externalYikeOrderRecordDTO);

}
