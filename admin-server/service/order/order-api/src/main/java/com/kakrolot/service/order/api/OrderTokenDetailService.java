package com.kakrolot.service.order.api;

import com.kakrolot.service.order.api.dto.OrderTokenDetailDTO;
import com.kakrolot.service.order.api.dto.QueryTokenDetailDTO;

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
    
    /**
     * 根据条件查询激活码列表总数
     * @param queryTokenDetailDTO 查询条件
     * @return 总数
     */
    Long countByCondition(QueryTokenDetailDTO queryTokenDetailDTO);
    
    /**
     * 根据条件查询激活码列表
     * @param queryTokenDetailDTO 查询条件
     * @return 激活码列表
     */
    List<OrderTokenDetailDTO> findByCondition(QueryTokenDetailDTO queryTokenDetailDTO);
    
    /**
     * 管理员根据条件查询激活码列表总数
     * @param queryTokenDetailDTO 查询条件
     * @return 总数
     */
    Long countByManagerCondition(QueryTokenDetailDTO queryTokenDetailDTO);
    
    /**
     * 管理员根据条件查询激活码列表
     * @param queryTokenDetailDTO 查询条件
     * @return 激活码列表
     */
    List<OrderTokenDetailDTO> findByManagerCondition(QueryTokenDetailDTO queryTokenDetailDTO);
} 