package com.kakrolot.service.order.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.order.dao.po.OrderTokenDetail;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderTokenDetailRepository extends CommonRepository<OrderTokenDetail, Long> {

    OrderTokenDetail getById(Long id);
    
    OrderTokenDetail findByToken(String token);
    
    List<OrderTokenDetail> findByOrderRecordId(Long orderRecordId);
    
    List<OrderTokenDetail> findByUserId(Long userId);
    
    List<OrderTokenDetail> findByAccountId(Long accountId);
    
    @Query(nativeQuery = true, value = "select * from order_token_detail where tb_shop_id = :tbShopId")
    List<OrderTokenDetail> findByTbShopId(@Param("tbShopId") Long tbShopId);
} 