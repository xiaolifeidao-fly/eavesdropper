package com.kakrolot.service.order;

import com.kakrolot.service.order.api.RefundOrderService;
import com.kakrolot.service.order.api.dto.OrderRefundRecordDTO;
import com.kakrolot.service.order.convert.OrderRefundRecordConverter;
import com.kakrolot.service.order.dao.po.OrderRefundRecord;
import com.kakrolot.service.order.dao.repository.OrderRefundRecordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class RefundOrderServiceImpl implements RefundOrderService {

    @Autowired
    private OrderRefundRecordRepository orderRefundRecordRepository;

    @Autowired
    private OrderRefundRecordConverter orderRefundRecordConverter;

    @Override
    public Long countByOrderId(Long orderId) {
        return orderRefundRecordRepository.countByOrderId(orderId);
    }

    @Override
    public OrderRefundRecordDTO save(OrderRefundRecordDTO orderRefundRecordDTO) {
        OrderRefundRecord orderRefundRecord = orderRefundRecordConverter.toPo(orderRefundRecordDTO);
        orderRefundRecordRepository.save(orderRefundRecord);
        return orderRefundRecordConverter.toDTO(orderRefundRecord);
    }

    @Override
    public OrderRefundRecordDTO findById(Long id) {
        OrderRefundRecord orderRefundRecord = orderRefundRecordRepository.getById(id);
        return orderRefundRecordConverter.toDTO(orderRefundRecord);
    }

    @Override
    public List<OrderRefundRecordDTO> findByOrderStatusAndShopCategoryId(String status, Long shopCategoryId, int orderFetchSize) {
        List<OrderRefundRecord> orderRefundRecords = orderRefundRecordRepository.findByOrderStatusAndShopCategoryId(status, shopCategoryId, orderFetchSize);
        return orderRefundRecordConverter.toDTOs(orderRefundRecords);
    }

    @Override
    public void updateStatusById(String status, Long refundOrderId) {
        orderRefundRecordRepository.updateStatusById(status, refundOrderId);
    }

    @Override
    public OrderRefundRecordDTO findByOrderId(Long orderId) {
        OrderRefundRecord orderRefundRecord = orderRefundRecordRepository.findByOrderId(orderId);
        return orderRefundRecordConverter.toDTO(orderRefundRecord);
    }
}
