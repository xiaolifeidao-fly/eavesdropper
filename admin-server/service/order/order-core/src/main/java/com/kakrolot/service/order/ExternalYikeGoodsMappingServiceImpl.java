package com.kakrolot.service.order;

import com.kakrolot.service.order.api.ExternalYikeGoodsMappingService;
import com.kakrolot.service.order.api.dto.ExternalYikeGoodsMappingDTO;
import com.kakrolot.service.order.convert.ExternalYikeGoodsMappingConverter;
import com.kakrolot.service.order.dao.repository.ExternalYikeGoodsMappingRepository;
import com.kakrolot.service.order.dao.po.ExternalYikeGoodsMapping;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ExternalYikeGoodsMappingServiceImpl implements ExternalYikeGoodsMappingService {
    
    @Autowired
    private ExternalYikeGoodsMappingRepository externalYikeGoodsMappingRepository;
    
    @Autowired
    private ExternalYikeGoodsMappingConverter externalYikeGoodsMappingConverter;
    
    @Override
    public ExternalYikeGoodsMappingDTO getByGoodsId(String goodsId) {
        ExternalYikeGoodsMapping mapping = externalYikeGoodsMappingRepository.findByGoodsId(goodsId);
        return externalYikeGoodsMappingConverter.toDTO(mapping);
    }

    @Override
    public List<ExternalYikeGoodsMappingDTO> getAll() {
        List<ExternalYikeGoodsMapping> mappings = externalYikeGoodsMappingRepository.findAll();
        return externalYikeGoodsMappingConverter.toDTOs(mappings);
    }
}
