package com.kakrolot.service.order.api;

import java.util.List;

import com.kakrolot.service.order.api.dto.ExternalYikeGoodsMappingDTO;

public interface ExternalYikeGoodsMappingService {

    ExternalYikeGoodsMappingDTO getByGoodsId(String goodsId);

    List<ExternalYikeGoodsMappingDTO> getAll();
    
}
