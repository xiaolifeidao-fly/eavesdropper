package com.kakrolot.service.order;

import com.kakrolot.service.order.api.ExternalYikeOrderRecordService;
import com.kakrolot.service.order.api.dto.ExternalYikeOrderRecordDTO;
import com.kakrolot.service.order.convert.ExternalYikeOrderRecordConverter;
import com.kakrolot.service.order.dao.repository.ExternalYikeOrderRecordRepository;
import com.kakrolot.service.order.dao.po.ExternalYikeOrderRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ExternalYikeOrderRecordServiceImpl implements ExternalYikeOrderRecordService {
    
    @Autowired
    private ExternalYikeOrderRecordRepository externalYikeOrderRecordRepository;
    
    @Autowired
    private ExternalYikeOrderRecordConverter externalYikeOrderRecordConverter;
    
    @Override
    public ExternalYikeOrderRecordDTO getByChannelAndExternalOrderId(String channel, String externalOrderId)
    {
        ExternalYikeOrderRecord record = externalYikeOrderRecordRepository.findByChannelAndExternalOrderId(channel, externalOrderId);
        return externalYikeOrderRecordConverter.toDTO(record);
    }
    
    @Override
    public ExternalYikeOrderRecordDTO save(ExternalYikeOrderRecordDTO recordDTO) {
        if (recordDTO == null) {
            return null;
        }
        ExternalYikeOrderRecord saved = externalYikeOrderRecordRepository.save(
            externalYikeOrderRecordConverter.toPo(recordDTO));
        return externalYikeOrderRecordConverter.toDTO(saved);
    }
}
