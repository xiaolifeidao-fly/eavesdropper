package com.kakrolot.service.order.api;

import com.kakrolot.service.order.api.dto.OrderTokenDetailDTO;

import java.util.List;

public interface OrderTokenDetailService {

    Long save(OrderTokenDetailDTO orderTokenDetailDTO);

    OrderTokenDetailDTO findById(Long id);
    
    OrderTokenDetailDTO findByToken(String token);
    
    List<OrderTokenDetailDTO> findByOrderRecordId(Long orderRecordId);
    
    List<OrderTokenDetailDTO> findByUserId(Long userId);
    
    List<OrderTokenDetailDTO> findByAccountId(Long accountId);
    
    List<OrderTokenDetailDTO> findByTbShopId(Long tbShopId);
    
    void deleteById(Long id);
} 