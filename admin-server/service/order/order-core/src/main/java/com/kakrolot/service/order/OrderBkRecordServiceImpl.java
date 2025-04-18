package com.kakrolot.service.order;

import com.kakrolot.service.order.api.OrderBkRecordService;
import com.kakrolot.service.order.api.dto.OrderBkRecordDTO;
import com.kakrolot.service.order.convert.OrderBkRecordConverter;
import com.kakrolot.service.order.dao.po.OrderBkRecord;
import com.kakrolot.service.order.dao.repository.OrderBkRecordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class OrderBkRecordServiceImpl implements OrderBkRecordService {

    @Autowired
    private OrderBkRecordRepository orderBkRecordRepository;

    @Autowired
    private OrderBkRecordConverter orderBkRecordConverter;


    @Override
    public void save(OrderBkRecordDTO orderBkRecordDTO) {
        OrderBkRecord orderBkRecord = orderBkRecordConverter.toPo(orderBkRecordDTO);
        orderBkRecordRepository.save(orderBkRecord);
    }

    @Override
    public OrderBkRecordDTO findByOrderId(Long id) {
        OrderBkRecord orderBkRecord = orderBkRecordRepository.findByOrderId(id);
        return orderBkRecordConverter.toDTO(orderBkRecord);
    }
}
