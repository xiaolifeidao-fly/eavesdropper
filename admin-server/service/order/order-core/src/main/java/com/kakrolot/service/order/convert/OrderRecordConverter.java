package com.kakrolot.service.order.convert;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.order.api.dto.GatewayOrderRecordDTO;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.order.api.dto.QueryOrderDTO;
import com.kakrolot.service.order.dao.po.GatewayQueryOrder;
import com.kakrolot.service.order.dao.po.OrderRecord;
import com.kakrolot.service.order.dao.po.QueryOrder;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderRecordConverter extends CommonConvert<OrderRecordDTO, OrderRecord> {

    public List<QueryOrderDTO> toQueryDTOs(List<QueryOrder> queryOrders) {
        if (queryOrders == null) {
            return Collections.emptyList();
        }
        return queryOrders.stream().map(this::toQueryDTO).collect(Collectors.toList());
    }

    private QueryOrderDTO toQueryDTO(QueryOrder queryOrder) {
        QueryOrderDTO queryOrderDTO = new QueryOrderDTO();
        BeanUtils.copyProperties(queryOrder, queryOrderDTO);
        return queryOrderDTO;
    }

    public List<GatewayOrderRecordDTO> toGatewayOrderRecordDTOs(List<GatewayQueryOrder> gatewayQueryOrders) {
        if (gatewayQueryOrders == null) {
            return Collections.emptyList();
        }
        return gatewayQueryOrders.stream().map(this::toGatewayOrderRecordDTO).collect(Collectors.toList());
    }

    public GatewayOrderRecordDTO toGatewayOrderRecordDTO(GatewayQueryOrder gatewayQueryOrder) {
        GatewayOrderRecordDTO gatewayOrderRecordDTO = new GatewayOrderRecordDTO();
        BeanUtils.copyProperties(gatewayQueryOrder, gatewayOrderRecordDTO);
        String params = gatewayQueryOrder.getParams();
        if (StringUtils.isNotBlank(params)) {
            gatewayOrderRecordDTO.setParams(JSONObject.parseObject(params));
        }
        return gatewayOrderRecordDTO;
    }
}
