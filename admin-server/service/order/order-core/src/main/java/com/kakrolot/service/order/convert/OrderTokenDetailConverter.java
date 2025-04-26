package com.kakrolot.service.order.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.order.api.dto.OrderTokenDetailDTO;
import com.kakrolot.service.order.dao.po.OrderTokenDetail;
import com.kakrolot.service.order.dao.po.QueryTokenDetail;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderTokenDetailConverter extends CommonConvert<OrderTokenDetailDTO, OrderTokenDetail> {

    /**
     * 将查询结果转换为DTO列表
     * @param queryTokenDetails 查询结果
     * @return DTO列表
     */
    public List<OrderTokenDetailDTO> toQueryDTOs(List<QueryTokenDetail> queryTokenDetails) {
        if (queryTokenDetails == null) {
            return null;
        }
        return queryTokenDetails.stream().map(this::toQueryDTO).collect(Collectors.toList());
    }
    
    /**
     * 将查询结果转换为DTO
     * @param queryTokenDetail 查询结果
     * @return DTO
     */
    private OrderTokenDetailDTO toQueryDTO(QueryTokenDetail queryTokenDetail) {
        if (queryTokenDetail == null) {
            return null;
        }
        OrderTokenDetailDTO dto = new OrderTokenDetailDTO();
        // 复制属性
        dto.setId(queryTokenDetail.getId());
        dto.setOrderRecordId(queryTokenDetail.getOrderRecordId());
        dto.setToken(queryTokenDetail.getToken());
        dto.setTbExternalId(queryTokenDetail.getTbExternalId());
        dto.setTbShopName(queryTokenDetail.getTbShopName());
        dto.setTbShopId(queryTokenDetail.getTbShopId());
        dto.setStatus(queryTokenDetail.getStatus());
        dto.setBindTime(queryTokenDetail.getBindTime());
        dto.setCreateTime(queryTokenDetail.getCreateTime());
        dto.setExpireTime(queryTokenDetail.getExpireTime());
        dto.setUserId(queryTokenDetail.getUserId());
        dto.setAccountId(queryTokenDetail.getAccountId());
        dto.setActive(queryTokenDetail.getActive());
        return dto;
    }
} 