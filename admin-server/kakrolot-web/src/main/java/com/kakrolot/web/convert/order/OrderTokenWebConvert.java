package com.kakrolot.web.convert.order;

import com.kakrolot.common.utils.DateUtils;
import com.kakrolot.service.order.api.dto.*;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.order.*;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;


@Component
public class OrderTokenWebConvert extends WebConvert<OrderTokenDetailDTO, OrderTokenDetailModel> {

    @Override
    public OrderTokenDetailModel toModel(OrderTokenDetailDTO orderTokenDetailDTO) {
        if (orderTokenDetailDTO == null) {
            return null;
        }
        OrderTokenDetailModel orderTokenDetailModel = new OrderTokenDetailModel();
        BeanUtils.copyProperties(orderTokenDetailDTO, orderTokenDetailModel);
        orderTokenDetailModel.setTokenCreateTime(DateUtils
                .formatDate(DateUtils.TimeType.yyyy_MM_ddHHmmSS, orderTokenDetailDTO.getCreateTime()));
        orderTokenDetailModel.setBindTime(DateUtils
                .formatDate(DateUtils.TimeType.yyyy_MM_ddHHmmSS, orderTokenDetailDTO.getBindTime()));
        orderTokenDetailModel.setStatus(TokenBindStatus.getDescriptionByName(orderTokenDetailDTO.getStatus()));
        return orderTokenDetailModel;
    }

}
