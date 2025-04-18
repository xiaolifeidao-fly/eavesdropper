package com.kakrolot.service.order;

import com.kakrolot.service.order.api.OrderAmountDetailService;
import com.kakrolot.service.order.api.dto.OrderAmountDetailDTO;
import com.kakrolot.service.order.convert.OrderAmountDetailConverter;
import com.kakrolot.service.order.dao.po.OrderAmountDetail;
import com.kakrolot.service.order.dao.repository.OrderAmountDetailRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class OrderAmountDetailServiceImpl implements OrderAmountDetailService {

    @Autowired
    private OrderAmountDetailConverter orderAmountDetailConverter;

    @Autowired
    private OrderAmountDetailRepository orderAmountDetailRepository;

    @Override
    public void save(OrderAmountDetailDTO orderAmountDetailDTO) {
        OrderAmountDetail orderAmountDetail = orderAmountDetailConverter.toPo(orderAmountDetailDTO);
        orderAmountDetailRepository.save(orderAmountDetail);
    }

    @Override
    public List<OrderAmountDetailDTO> findByOrderId(Long orderId) {
        List<OrderAmountDetail> orderAmountDetails = orderAmountDetailRepository.findByOrderId(orderId);
        return orderAmountDetailConverter.toDTOs(orderAmountDetails);
    }
}
