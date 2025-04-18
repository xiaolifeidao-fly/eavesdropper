package com.kakrolot.service.order.api;

import com.kakrolot.service.order.api.dto.GatewayOrderRecordDTO;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.order.api.dto.QueryOrderDTO;

import java.util.Date;
import java.util.List;

public interface OrderRecordService {

    Long save(OrderRecordDTO orderDTO);

    OrderRecordDTO findById(Long id);

    Long getActualDoneSummary(List<Long> shopIds, Date start, Date end);

    void updateOrderStatusAndInitNumAndEndNumById(String orderStatus, Long initNum, Long endNum, Long orderId);

    Long countByCondition(QueryOrderDTO queryOrderDTO);

    List<QueryOrderDTO> findByCondition(QueryOrderDTO queryOrderDTO);

    Long countByManagerCondition(QueryOrderDTO queryOrderDTO);

    List<QueryOrderDTO> findByManagerCondition(QueryOrderDTO queryOrderDTO);

    List<GatewayOrderRecordDTO> findByOrderStatusAndShopCategoryId(String orderStatus, Long shopCategoryId, int fetchNum);

    Long countByDateAndOrderStatusIn(Date start, Date end, List<String> orderStatuses);

    Long countByDateAndOrderStatusInAndShopIdIn(Date start, Date end, List<String> orderStatuses, List<Long> shopIds);

    Long countByOrderStatusInAndShopIdIn(List<String> orderStatuses, List<Long> shopIds);

    List<OrderRecordDTO> findByOrderStatusAndCreatedTime(String name, Date date);

    OrderRecordDTO findByOrderHash(String orderHash);

    OrderRecordDTO findTopByShopIdAndBusinessIdOrderByCreateTimeDesc(Long shopId, String businessId);

    OrderRecordDTO findByTinyUrlAndOrderStatusesAndShopCategoryId(String tinyUrl, List<String> orderStatuses, Long shopCategoryId);

    List<OrderRecordDTO> findByChannelAndOrderStatuses(String channel, List<String> orderStatuses);

    OrderRecordDTO findByChannelAndExternalOrderId(String channel, String externalOrderId);
}
