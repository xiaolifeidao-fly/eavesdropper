package com.kakrolot.service.order;

import com.kakrolot.service.order.api.OrderRecordExtParamService;
import com.kakrolot.service.order.api.dto.OrderRecordExtParamDTO;
import com.kakrolot.service.order.convert.OrderRecordExtParamConverter;
import com.kakrolot.service.order.dao.po.OrderRecordExtParam;
import com.kakrolot.service.order.dao.repository.OrderRecordExtParamRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by roc_peng on 2020/12/7.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Slf4j
@Service
public class OrderRecordExtParamServiceImpl implements OrderRecordExtParamService {

    @Autowired
    private OrderRecordExtParamRepository orderRecordExtParamRepository;

    @Autowired
    private OrderRecordExtParamConverter orderRecordExtParamConverter;


    @Override
    public OrderRecordExtParamDTO getById(Long id) {
        OrderRecordExtParam orderRecordExtParam = orderRecordExtParamRepository.getById(id);
        return orderRecordExtParamConverter.toDTO(orderRecordExtParam);
    }

    @Override
    public OrderRecordExtParamDTO findByOrderRecordId(Long orderRecordId) {
        OrderRecordExtParam byOrderRecordId = orderRecordExtParamRepository.findByOrderRecordId(orderRecordId);
        return orderRecordExtParamConverter.toDTO(byOrderRecordId);
    }

    @Override
    public List<OrderRecordExtParamDTO> save(List<OrderRecordExtParamDTO> orderRecordExtParamDTOList) {
        if (CollectionUtils.isEmpty(orderRecordExtParamDTOList)) {
            return Collections.emptyList();
        }
        return orderRecordExtParamDTOList.stream().map(this::save).collect(Collectors.toList());
    }

    @Override
    public OrderRecordExtParamDTO save(OrderRecordExtParamDTO orderRecordExtParamDTO) {
        if(orderRecordExtParamDTO == null) {
            return null;
        }
        OrderRecordExtParam save = orderRecordExtParamRepository.save(orderRecordExtParamConverter.toPo(orderRecordExtParamDTO));
        return orderRecordExtParamConverter.toDTO(save);
    }

}
