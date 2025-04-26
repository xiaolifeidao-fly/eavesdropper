package com.kakrolot.service.order.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.order.dao.po.OrderTokenDetail;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderTokenDetailRepository extends CommonRepository<OrderTokenDetail, Long> {

    OrderTokenDetail getById(Long id);
    
    OrderTokenDetail findByToken(String token);
    
    List<OrderTokenDetail> findByOrderRecordId(Long orderRecordId);
    
    List<OrderTokenDetail> findByUserId(Long userId);
    
    List<OrderTokenDetail> findByAccountId(Long accountId);
    
    @Query(nativeQuery = true, value = "select * from order_token_detail where tb_shop_id = :tbShopId")
    List<OrderTokenDetail> findByTbShopId(@Param("tbShopId") Long tbShopId);
    
    /**
     * 根据淘宝店铺ID和状态查找记录，并按绑定时间降序排序
     * @param tbShopId 淘宝店铺ID
     * @param status 状态
     * @return 记录列表
     */
    List<OrderTokenDetail> findByTbShopIdAndStatusOrderByBindTimeDesc(String tbShopId, String status);
} 