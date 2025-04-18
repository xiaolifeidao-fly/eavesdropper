package com.kakrolot.web.convert.order;

import com.kakrolot.common.utils.DateUtils;
import com.kakrolot.service.order.api.dto.OrderAmountDetailDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.order.OrderAmountDetailModel;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderAmountDetailWebConvert extends WebConvert<OrderAmountDetailDTO, OrderAmountDetailModel> {

    public List<OrderAmountDetailModel> convertModels(List<OrderAmountDetailDTO> orderAmountDetailDTOList) {
        return orderAmountDetailDTOList.stream().map(this::convertModel).collect(Collectors.toList());
    }

    OrderAmountDetailModel convertModel(OrderAmountDetailDTO orderAmountDetailDTO) {
        if (orderAmountDetailDTO == null) {
            return null;
        }
        OrderAmountDetailModel orderAmountDetailModel = new OrderAmountDetailModel();
        BeanUtils.copyProperties(orderAmountDetailDTO, orderAmountDetailModel);
        orderAmountDetailModel.setOperateTime(DateUtils.formatDate(DateUtils.TimeType.yyyy_MM_ddHHmmSS, orderAmountDetailDTO.getCreateTime()));
        return orderAmountDetailModel;
    }

}
