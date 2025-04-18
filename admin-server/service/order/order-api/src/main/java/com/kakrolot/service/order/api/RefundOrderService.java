package com.kakrolot.service.order.api;

import com.kakrolot.service.order.api.dto.OrderRefundRecordDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface RefundOrderService {

    Long countByOrderId(Long orderId);

    OrderRefundRecordDTO save(OrderRefundRecordDTO buildRefundOrderDTO);

    OrderRefundRecordDTO findById(Long id);

    List<OrderRefundRecordDTO> findByOrderStatusAndShopCategoryId(String status, Long shopCategoryId, int orderFetchSize);

    @Transactional
    void updateStatusById(String name, Long refundOrderId);

    OrderRefundRecordDTO findByOrderId(Long orderId);
}
