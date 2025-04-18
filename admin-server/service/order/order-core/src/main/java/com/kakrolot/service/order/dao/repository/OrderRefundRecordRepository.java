package com.kakrolot.service.order.dao.repository;

import com.kakrolot.service.order.dao.po.OrderRefundRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRefundRecordRepository extends JpaRepository<OrderRefundRecord, Long> {

    Long countByOrderId(Long orderId);

    OrderRefundRecord getById(Long id);

    @Query(nativeQuery = true, value = "select * from order_refund_record where shop_category_id =:shopCategoryId and  order_refund_status = :orderStatus limit :fetchNum")
    List<OrderRefundRecord> findByOrderStatusAndShopCategoryId(@Param("orderStatus") String orderStatus, @Param("shopCategoryId") Long shopCategoryId, @Param("fetchNum") int fetchNum);

    @Query(nativeQuery = true, value = "update order_refund_record set order_refund_status = :orderStatus where id = :id")
    @Modifying
    void updateStatusById(@Param("orderStatus") String status, @Param("id") Long refundOrderId);

    OrderRefundRecord findByOrderId(Long orderId);
}
