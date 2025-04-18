package com.kakrolot.service.order.dao.repository;

import com.kakrolot.service.order.dao.po.OrderBkRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface OrderBkRecordRepository extends JpaRepository<OrderBkRecord, Long> {

    OrderBkRecord findByOrderId(Long orderId);

    @Query(nativeQuery = true, value = "select count(1),sum(num) " +
            "from order_bk_record " +
            "where update_time> :startTime and update_time< :endTime " +
            "and shop_category_id in (:shopCategoryIds)")
    List getOrderBKRecordSummary(@Param("shopCategoryIds") List<Long> shopCategoryIds,@Param("startTime") Date startTime, @Param("endTime") Date endTime);
}
