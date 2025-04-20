package com.kakrolot.service.order;

import com.kakrolot.service.order.api.OrderTokenDetailService;
import com.kakrolot.service.order.api.dto.OrderTokenDetailDTO;
import com.kakrolot.service.order.convert.OrderTokenDetailConverter;
import com.kakrolot.service.order.dao.po.OrderTokenDetail;
import com.kakrolot.service.order.dao.repository.OrderTokenDetailRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
public class OrderTokenDetailServiceImpl implements OrderTokenDetailService {

    @Autowired
    private OrderTokenDetailRepository orderTokenDetailRepository;

    @Autowired
    private OrderTokenDetailConverter orderTokenDetailConverter;

    @Override
    @Transactional
    public Long save(OrderTokenDetailDTO orderTokenDetailDTO) {
        OrderTokenDetail orderTokenDetail = orderTokenDetailConverter.toPo(orderTokenDetailDTO);
        orderTokenDetailRepository.save(orderTokenDetail);
        return orderTokenDetail.getId();
    }

    @Override
    public OrderTokenDetailDTO findById(Long id) {
        OrderTokenDetail orderTokenDetail = orderTokenDetailRepository.getById(id);
        return orderTokenDetailConverter.toDTO(orderTokenDetail);
    }

    @Override
    public OrderTokenDetailDTO findByToken(String token) {
        OrderTokenDetail orderTokenDetail = orderTokenDetailRepository.findByToken(token);
        return orderTokenDetailConverter.toDTO(orderTokenDetail);
    }

    @Override
    public List<OrderTokenDetailDTO> findByOrderRecordId(Long orderRecordId) {
        List<OrderTokenDetail> orderTokenDetails = orderTokenDetailRepository.findByOrderRecordId(orderRecordId);
        return orderTokenDetailConverter.toDTOs(orderTokenDetails);
    }

    @Override
    public List<OrderTokenDetailDTO> findByUserId(Long userId) {
        List<OrderTokenDetail> orderTokenDetails = orderTokenDetailRepository.findByUserId(userId);
        return orderTokenDetailConverter.toDTOs(orderTokenDetails);
    }

    @Override
    public List<OrderTokenDetailDTO> findByAccountId(Long accountId) {
        List<OrderTokenDetail> orderTokenDetails = orderTokenDetailRepository.findByAccountId(accountId);
        return orderTokenDetailConverter.toDTOs(orderTokenDetails);
    }

    @Override
    public List<OrderTokenDetailDTO> findByTbShopId(Long tbShopId) {
        List<OrderTokenDetail> orderTokenDetails = orderTokenDetailRepository.findByTbShopId(tbShopId);
        return orderTokenDetailConverter.toDTOs(orderTokenDetails);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        orderTokenDetailRepository.deleteById(id);
    }
} 