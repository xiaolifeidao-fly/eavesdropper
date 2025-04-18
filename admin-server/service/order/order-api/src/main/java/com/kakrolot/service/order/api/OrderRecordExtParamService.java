package com.kakrolot.service.order.api;


import com.kakrolot.service.order.api.dto.OrderRecordExtParamDTO;

import java.util.List;

public interface OrderRecordExtParamService {

    OrderRecordExtParamDTO getById(Long id);

    OrderRecordExtParamDTO findByOrderRecordId(Long orderRecordId);

    List<OrderRecordExtParamDTO> save(List<OrderRecordExtParamDTO> orderRecordExtParamDTOList);

    OrderRecordExtParamDTO save(OrderRecordExtParamDTO orderRecordExtParamDTO);

}
