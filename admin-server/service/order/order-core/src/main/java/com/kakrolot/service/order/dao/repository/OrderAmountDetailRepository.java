package com.kakrolot.service.order.dao.repository;

import com.kakrolot.service.order.dao.po.OrderAmountDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderAmountDetailRepository extends JpaRepository<OrderAmountDetail, Long> {

    List<OrderAmountDetail> findByOrderId(Long orderId);
}
