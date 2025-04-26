package com.kakrolot.service.order;

import com.kakrolot.service.common.context.TenantContext;
import com.kakrolot.service.order.api.OrderTokenDetailService;
import com.kakrolot.service.order.api.dto.OrderTokenDetailDTO;
import com.kakrolot.service.order.api.dto.QueryTokenDetailDTO;
import com.kakrolot.service.order.convert.OrderTokenDetailConverter;
import com.kakrolot.service.order.dao.po.OrderTokenDetail;
import com.kakrolot.service.order.dao.po.QueryTokenDetail;
import com.kakrolot.service.order.dao.repository.OrderTokenDetailRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    
    @Override
    public Long countByCondition(QueryTokenDetailDTO queryTokenDetailDTO) {
        StringBuffer sql = new StringBuffer();
        sql.append("select count(1) ")
                .append("from order_token_detail t ")
                .append("where t.active = 1");
        fillWhere(queryTokenDetailDTO, sql, false);
        Map<String, Object> map = buildParams(queryTokenDetailDTO, false);
        return orderTokenDetailRepository.countByCondition(sql.toString(), map);
    }
    
    @Override
    public List<OrderTokenDetailDTO> findByCondition(QueryTokenDetailDTO queryTokenDetailDTO) {
        StringBuffer sql = new StringBuffer();
        sql.append("select t.* ")
                .append("from order_token_detail t ")
                .append("where t.active = 1 ");
        fillWhere(queryTokenDetailDTO, sql, false);
        sql.append(" order by t.id desc ");
        Map<String, Object> map = buildParams(queryTokenDetailDTO, false);
        int startIndex = queryTokenDetailDTO.getStartIndex() != null ? queryTokenDetailDTO.getStartIndex() : 0;
        int pageSize = queryTokenDetailDTO.getPageSize() != null ? queryTokenDetailDTO.getPageSize() : 10;
        List<QueryTokenDetail> queryTokenDetails = orderTokenDetailRepository.findByCondition(sql.toString(), startIndex, pageSize, map, QueryTokenDetail.class);
        return orderTokenDetailConverter.toQueryDTOs(queryTokenDetails);
    }
    
    @Override
    public Long countByManagerCondition(QueryTokenDetailDTO queryTokenDetailDTO) {
        StringBuffer sql = new StringBuffer();
        sql.append("select count(1) ")
                .append("from order_token_detail t ")
                .append("where t.active = 1");
        fillWhere(queryTokenDetailDTO, sql, true);
        Map<String, Object> map = buildParams(queryTokenDetailDTO, true);
        return orderTokenDetailRepository.countByCondition(sql.toString(), map);
    }
    
    @Override
    public List<OrderTokenDetailDTO> findByManagerCondition(QueryTokenDetailDTO queryTokenDetailDTO) {
        StringBuffer sql = new StringBuffer();
        sql.append("select t.* ")
                .append("from order_token_detail t ")
                .append("where t.active = 1 ");
        fillWhere(queryTokenDetailDTO, sql, true);
        sql.append(" order by t.id desc ");
        Map<String, Object> map = buildParams(queryTokenDetailDTO, true);
        int startIndex = queryTokenDetailDTO.getStartIndex() != null ? queryTokenDetailDTO.getStartIndex() : 0;
        int pageSize = queryTokenDetailDTO.getPageSize() != null ? queryTokenDetailDTO.getPageSize() : 10;
        List<QueryTokenDetail> queryTokenDetails = orderTokenDetailRepository.findByCondition(sql.toString(), startIndex, pageSize, map, QueryTokenDetail.class);
        return orderTokenDetailConverter.toQueryDTOs(queryTokenDetails);
    }
    
    private void fillWhere(QueryTokenDetailDTO queryTokenDetailDTO, StringBuffer sql, Boolean manager) {
        if (queryTokenDetailDTO.getOrderRecordId() != null) {
            sql.append(" and t.order_record_id = :orderRecordId");
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getToken())) {
            sql.append(" and t.token like :token");
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getTbShopName())) {
            sql.append(" and t.tb_shop_name like :tbShopName");
        }
        if (queryTokenDetailDTO.getTbShopId() != null) {
            sql.append(" and t.tb_shop_id = :tbShopId");
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getStatus())) {
            sql.append(" and t.status = :status");
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getBindTimeStart())) {
            sql.append(" and t.bind_time >= :bindTimeStart");
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getBindTimeEnd())) {
            sql.append(" and t.bind_time <= :bindTimeEnd");
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getCreateTimeStart())) {
            sql.append(" and t.create_time >= :createTimeStart");
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getCreateTimeEnd())) {
            sql.append(" and t.create_time <= :createTimeEnd");
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getExpireTimeStart())) {
            sql.append(" and t.expire_time >= :expireTimeStart");
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getExpireTimeEnd())) {
            sql.append(" and t.expire_time <= :expireTimeEnd");
        }
        if (queryTokenDetailDTO.getUserId() != null) {
            sql.append(" and t.user_id = :userId");
        }
//        if (!manager) {
//            sql.append(" and t.tenant_id in (:tenantIds)");
//        }
    }
    
    private Map<String, Object> buildParams(QueryTokenDetailDTO queryTokenDetailDTO, Boolean manager) {
        Map<String, Object> params = new HashMap<>();
        if (queryTokenDetailDTO.getOrderRecordId() != null) {
            params.put("orderRecordId", queryTokenDetailDTO.getOrderRecordId());
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getToken())) {
            params.put("token", "%" + queryTokenDetailDTO.getToken() + "%");
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getTbShopName())) {
            params.put("tbShopName", "%" + queryTokenDetailDTO.getTbShopName() + "%");
        }
        if (queryTokenDetailDTO.getTbShopId() != null) {
            params.put("tbShopId", queryTokenDetailDTO.getTbShopId());
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getStatus())) {
            params.put("status", queryTokenDetailDTO.getStatus());
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getBindTimeStart())) {
            params.put("bindTimeStart", queryTokenDetailDTO.getBindTimeStart());
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getBindTimeEnd())) {
            params.put("bindTimeEnd", queryTokenDetailDTO.getBindTimeEnd());
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getCreateTimeStart())) {
            params.put("createTimeStart", queryTokenDetailDTO.getCreateTimeStart());
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getCreateTimeEnd())) {
            params.put("createTimeEnd", queryTokenDetailDTO.getCreateTimeEnd());
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getExpireTimeStart())) {
            params.put("expireTimeStart", queryTokenDetailDTO.getExpireTimeStart());
        }
        if (StringUtils.isNotBlank(queryTokenDetailDTO.getExpireTimeEnd())) {
            params.put("expireTimeEnd", queryTokenDetailDTO.getExpireTimeEnd());
        }
        if (queryTokenDetailDTO.getUserId() != null) {
            params.put("userId", queryTokenDetailDTO.getUserId());
        }
//        if (!manager) {
//            params.put("tenantIds", TenantContext.get());
//        }
        return params;
    }
} 