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
        orderTokenDetailModel.setExpireTime(DateUtils
                .formatDate(DateUtils.TimeType.yyyy_MM_ddHHmmSS, orderTokenDetailDTO.getExpireTime()));
        orderTokenDetailModel.setStatus(TokenBindStatus.getDescriptionByName(orderTokenDetailDTO.getStatus()));
        return orderTokenDetailModel;
    }

    /**
     * 将查询Model转换为查询DTO
     *
     * @param model 查询Model
     * @param startIndex 开始索引
     * @param pageSize 每页大小
     * @return 查询DTO
     */
    public QueryTokenDetailDTO toQueryDTO(QueryTokenDetailModel model, int startIndex, int pageSize) {
        if (model == null) {
            return null;
        }
        QueryTokenDetailDTO dto = new QueryTokenDetailDTO();
        dto.setOrderRecordId(model.getOrderRecordId());
        dto.setToken(model.getToken());
        dto.setTbShopName(model.getTbShopName());
        dto.setTbShopId(model.getTbShopId());
        dto.setStatus(model.getStatus());
        dto.setBindTimeStart(model.getBindTimeStart());
        dto.setBindTimeEnd(model.getBindTimeEnd());
        dto.setCreateTimeStart(model.getCreateTimeStart());
        dto.setCreateTimeEnd(model.getCreateTimeEnd());
        dto.setExpireTimeStart(model.getExpireTimeStart());
        dto.setExpireTimeEnd(model.getExpireTimeEnd());
        dto.setUserId(model.getUserId());
        dto.setStartIndex(startIndex);
        dto.setPageSize(pageSize);
        return dto;
    }
}
