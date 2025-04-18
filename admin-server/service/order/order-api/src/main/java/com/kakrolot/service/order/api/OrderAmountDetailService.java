package com.kakrolot.service.order.api;

import com.kakrolot.service.order.api.dto.OrderAmountDetailDTO;

import java.util.List;

public interface OrderAmountDetailService {

    void save(OrderAmountDetailDTO orderAmountDetailDTO);

    List<OrderAmountDetailDTO> findByOrderId(Long orderId);
}
