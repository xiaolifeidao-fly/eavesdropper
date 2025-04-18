package com.kakrolot.service.order.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.order.dao.po.ExternalYikeGoodsMapping;

public interface ExternalYikeGoodsMappingRepository extends CommonRepository<ExternalYikeGoodsMapping, Long> {

    ExternalYikeGoodsMapping getById(Long id);

    ExternalYikeGoodsMapping findByGoodsId(String goodsId);
}

