package com.kakrolot.service.order;

import com.kakrolot.common.utils.TranslateUtils;
import com.kakrolot.service.common.context.TenantContext;
import com.kakrolot.service.order.api.OrderRecordService;
import com.kakrolot.service.order.api.dto.GatewayOrderRecordDTO;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.order.api.dto.QueryOrderDTO;
import com.kakrolot.service.order.convert.OrderRecordConverter;
import com.kakrolot.service.order.dao.po.GatewayQueryOrder;
import com.kakrolot.service.order.dao.po.OrderRecord;
import com.kakrolot.service.order.dao.po.QueryOrder;
import com.kakrolot.service.order.dao.repository.OrderRecordRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class OrderRecordServiceImpl implements OrderRecordService {

    @Autowired
    private OrderRecordRepository orderRecordRepository;

    @Autowired
    private OrderRecordConverter orderConverter;

    @Override
    public Long save(OrderRecordDTO orderDTO) {
        OrderRecord order = orderConverter.toPo(orderDTO);
        order.setTinyUrl(TranslateUtils.convertTinyUrl(order.getBusinessId()));
        order.setOrderHash(TranslateUtils.getOrderHashStr(orderDTO.getBusinessId()));
        orderRecordRepository.save(order);
        return order.getId();
    }

    @Override
    public OrderRecordDTO findById(Long id) {
        OrderRecord orderRecord = orderRecordRepository.getById(id);
        return orderConverter.toDTO(orderRecord);
    }

    @Override
    public Long getActualDoneSummary(List<Long> shopIds, Date start, Date end) {
        return orderRecordRepository.getActualDoneSummary(shopIds, start, end);
    }

    @Override
    @Transactional
    public void updateOrderStatusAndInitNumAndEndNumById(String orderStatus, Long initNum, Long endNum, Long orderId) {
        orderRecordRepository.updateOrderStatusAndInitNumAndEndNumById(orderStatus, initNum, endNum, orderId);
    }

    @Override
    public Long countByCondition(QueryOrderDTO queryOrderDTO) {
        StringBuffer sql = new StringBuffer();
        sql.append("select count(1) ")
                .append("from order_record o ")
                .append("where o.active = 1");
        fillWhere(queryOrderDTO, sql, false);
        Map<String, Object> map = buildParams(queryOrderDTO, false);
        return orderRecordRepository.countByCondition(sql.toString(), map);
    }

    private void fillWhere(QueryOrderDTO queryOrderDTO, StringBuffer sql, Boolean manager) {
        if (queryOrderDTO.getOrderRecordId() != null) {
            sql.append(" and o.id = :orderRecordId");
        }
        if (StringUtils.isNotBlank(queryOrderDTO.getOrderStatus())) {
            sql.append(" and o.order_status = :orderStatus");
        }
        if (StringUtils.isNotBlank(queryOrderDTO.getRefundStatus())) {
            sql.append(" and r.order_refund_status = :refundStatus");
        }
        if (queryOrderDTO.getTenantId() != null) {
            sql.append(" and o.tenant_id = :tenantId");
        }
        if (queryOrderDTO.getShopId() != null) {
            sql.append(" and o.shop_id = :shopId");
        }
        if (queryOrderDTO.getShopCategoryId() != null) {
            sql.append(" and o.shop_category_id = :shopCategoryId");
        }
        if (queryOrderDTO.getStartTime() != null) {
            sql.append(" and o.create_time >=:startTime");
        }
        if (queryOrderDTO.getEndTime() != null) {
            sql.append(" and o.create_time <=:endTime");
        }
        if (queryOrderDTO.getUserId() != null) {
            sql.append(" and o.user_id =:userId");
        }
        if (StringUtils.isNotBlank(queryOrderDTO.getTinyUrl())) {
            sql.append(" and o.tiny_url =:tinyUrl");
        }
        if (StringUtils.isNotBlank(queryOrderDTO.getUserName())) {
            sql.append(" and o.user_name =:userName");
        }
        if (!manager) {
            sql.append(" and o.tenant_id in (:tenantIds)");
        }
    }

    private Map<String, Object> buildParams(QueryOrderDTO queryOrderDTO, Boolean manager) {
        Map<String, Object> params = new HashMap<>();
        if (queryOrderDTO.getOrderRecordId() != null) {
            params.put("orderRecordId", queryOrderDTO.getOrderRecordId());
        }
        if (StringUtils.isNotBlank(queryOrderDTO.getOrderStatus())) {
            params.put("orderStatus", queryOrderDTO.getOrderStatus());
        }
        if (StringUtils.isNotBlank(queryOrderDTO.getRefundStatus())) {
            params.put("refundStatus", queryOrderDTO.getRefundStatus());
        }
        if (queryOrderDTO.getTenantId() != null) {
            params.put("tenantId", queryOrderDTO.getTenantId());
        }
        if (queryOrderDTO.getShopId() != null) {
            params.put("shopId", queryOrderDTO.getShopId());
        }
        if (queryOrderDTO.getShopCategoryId() != null) {
            params.put("shopCategoryId", queryOrderDTO.getShopCategoryId());
        }
        if (queryOrderDTO.getStartTime() != null) {
            params.put("startTime", queryOrderDTO.getStartTime());
        }
        if (queryOrderDTO.getEndTime() != null) {
            params.put("endTime", queryOrderDTO.getEndTime());
        }
        if (queryOrderDTO.getUserId() != null) {
            params.put("userId", queryOrderDTO.getUserId());
        }
        if (StringUtils.isNotBlank(queryOrderDTO.getTinyUrl())) {
            params.put("tinyUrl", queryOrderDTO.getTinyUrl());
        }
        if (StringUtils.isNotBlank(queryOrderDTO.getUserName())) {
            params.put("userName", queryOrderDTO.getUserName());
        }
        if (!manager) {
            params.put("tenantIds", TenantContext.get());
        }
        return params;
    }

    @Override
    public List<QueryOrderDTO> findByCondition(QueryOrderDTO queryOrderDTO) {
        StringBuffer sql = new StringBuffer();
        sql.append("select o.*, r.order_refund_status as refund_status ")
                .append("from order_record o ")
                .append("left join order_refund_record r on r.order_id = o.id ")
                .append("where o.active = 1 ");
        fillWhere(queryOrderDTO, sql, false);
        sql.append(" order by o.id desc ");
        Map<String, Object> map = buildParams(queryOrderDTO, false);
        List<QueryOrder> queryOrders = orderRecordRepository.findByCondition(sql.toString(), queryOrderDTO.getStartIndex(), queryOrderDTO.getPageSize(), map, QueryOrder.class);
        return orderConverter.toQueryDTOs(queryOrders);
    }

    @Override
    public Long countByManagerCondition(QueryOrderDTO queryOrderDTO) {
        StringBuffer sql = new StringBuffer();
        sql.append("select count(1) ")
                .append("from order_record o ")
                .append("left join order_refund_record r on r.order_id = o.id ")
                .append("where o.active = 1");
        fillWhere(queryOrderDTO, sql, true);
        Map<String, Object> map = buildParams(queryOrderDTO, true);
        return orderRecordRepository.countByCondition(sql.toString(), map);
    }

    @Override
    public List<QueryOrderDTO> findByManagerCondition(QueryOrderDTO queryOrderDTO) {
        StringBuffer sql = new StringBuffer();
        sql.append("select o.*, r.order_refund_status as refund_status ")
                .append("from order_record o ")
                .append("left join order_refund_record r on r.order_id = o.id ")
                .append("where o.active = 1 ");
        fillWhere(queryOrderDTO, sql, true);
        sql.append(" order by o.id desc ");
        Map<String, Object> map = buildParams(queryOrderDTO, true);
        List<QueryOrder> queryOrders = orderRecordRepository.findByCondition(sql.toString(), queryOrderDTO.getStartIndex(), queryOrderDTO.getPageSize(), map, QueryOrder.class);
        return orderConverter.toQueryDTOs(queryOrders);
    }

    @Override
    public List<GatewayOrderRecordDTO> findByOrderStatusAndShopCategoryId(String orderStatus, Long shopCategoryId, int fetchNum) {
        StringBuffer sql = new StringBuffer();
        sql.append("select o.*,p.params from order_record o left join order_record_ext_param p on p.order_record_id = o.id where o.shop_category_id =:shopCategoryId and o.order_status = :orderStatus limit :fetchNum");
        Map<String, Object> map = buildGatewayParams(orderStatus, shopCategoryId, fetchNum);
        List<GatewayQueryOrder> gatewayQueryOrders = orderRecordRepository.findByCondition(sql.toString(), map, GatewayQueryOrder.class);
        return orderConverter.toGatewayOrderRecordDTOs(gatewayQueryOrders);
    }

    private Map<String, Object> buildGatewayParams(String orderStatus, Long shopCategoryId, int fetchNum) {
        Map<String, Object> params = new HashMap<>();
        params.put("orderStatus", orderStatus);
        params.put("shopCategoryId", shopCategoryId);
        params.put("fetchNum", fetchNum);
        return params;
    }

    @Override
    public Long countByDateAndOrderStatusIn(Date start, Date end, List<String> orderStatuses) {
        return orderRecordRepository.countByDateAndOrderStatusIn(start, end, orderStatuses);
    }

    @Override
    public Long countByDateAndOrderStatusInAndShopIdIn(Date start, Date end, List<String> orderStatuses, List<Long> shopIds) {
        return orderRecordRepository.countByDateAndOrderStatusInAndShopIdIn(start, end, orderStatuses, shopIds);
    }

    @Override
    public Long countByOrderStatusInAndShopIdIn(List<String> orderStatuses, List<Long> shopIds) {
        return orderRecordRepository.countByDateAndOrderStatusInAndShopIdIn(orderStatuses, shopIds);
    }

    @Override
    public List<OrderRecordDTO> findByOrderStatusAndCreatedTime(String orderStatus, Date date) {
        List<OrderRecord> orderRecords = orderRecordRepository.findByOrderStatusAndCreatedTime(orderStatus, date);
        return orderConverter.toDTOs(orderRecords);
    }

    @Override
    public OrderRecordDTO findByOrderHash(String orderHash) {
        OrderRecord orderRecord = orderRecordRepository.findByOrderHash(orderHash);
        return orderConverter.toDTO(orderRecord);
    }

    @Override
    public OrderRecordDTO findTopByShopIdAndBusinessIdOrderByCreateTimeDesc(Long shopId, String businessId) {
        OrderRecord orderRecord = orderRecordRepository.findTopByShopIdAndBusinessIdOrderByCreateTimeDesc(shopId, businessId);
        return orderConverter.toDTO(orderRecord);
    }

    @Override
    public OrderRecordDTO findByTinyUrlAndOrderStatusesAndShopCategoryId(String tinyUrl, List<String> orderStatuses, Long shopCategoryId) {
        OrderRecord orderRecord = orderRecordRepository.findTopByTinyUrlAndOrderStatusInAndShopCategoryId(tinyUrl, orderStatuses, shopCategoryId);
        return orderConverter.toDTO(orderRecord);
    }

    @Override
    public List<OrderRecordDTO> findByChannelAndOrderStatuses(String channel, List<String> orderStatuses) {
        List<OrderRecord> orderRecords = orderRecordRepository.findByChannelAndOrderStatusIn(channel, orderStatuses);
        return orderConverter.toDTOs(orderRecords);
    }

    @Override
    public OrderRecordDTO findByChannelAndExternalOrderId(String channel, String externalOrderId) {
        OrderRecord orderRecord = orderRecordRepository.findByChannelAndExternalOrderId(channel, externalOrderId);
        return orderConverter.toDTO(orderRecord);
    }
}
