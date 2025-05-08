package com.kakrolot.service.order;

import com.kakrolot.service.business.response.BindResult;
import com.kakrolot.service.common.context.TenantContext;
import com.kakrolot.service.order.api.OrderTokenDetailService;
import com.kakrolot.service.order.api.dto.OrderTokenDetailDTO;
import com.kakrolot.service.order.api.dto.QueryTokenDetailDTO;
import com.kakrolot.service.order.api.dto.TokenBindStatus;
import com.kakrolot.service.order.convert.OrderTokenDetailConverter;
import com.kakrolot.service.order.dao.po.OrderTokenDetail;
import com.kakrolot.service.order.dao.po.QueryTokenDetail;
import com.kakrolot.service.order.dao.repository.OrderTokenDetailRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
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
    @Transactional
    public BindResult bindToken(String token, String tbShopName, String tbShopId) {
        if (StringUtils.isBlank(token)) {
            log.error("绑定失败：token为空");
            return BindResult.fail("激活码不能为空");
        }
        
        // 查找token
        OrderTokenDetail orderTokenDetail = orderTokenDetailRepository.findByToken(token);
        if (orderTokenDetail == null) {
            log.error("绑定失败：token不存在, token={}", token);
            return BindResult.fail("激活码不存在");
        }
        
        // 检查token状态是否允许绑定
        if (!TokenBindStatus.UNBIND.name().equals(orderTokenDetail.getStatus())) {
            log.error("绑定失败：token已绑定, token={}", token);
            return BindResult.fail("激活码已被绑定，不能重复绑定");
        }

        // 更新token绑定信息
        orderTokenDetail.setTbShopName(tbShopName);
        orderTokenDetail.setTbShopId(tbShopId);
        orderTokenDetail.setStatus(TokenBindStatus.BOUND.name()); // 更新状态为已绑定
        orderTokenDetail.setBindTime(new Date()); // 设置绑定时间
        // TODO 这里根据参数配置 设置失效时间
        // orderTokenDetail.setExpireTime(DateUtils.addMonths(new Date(), 1));
        try {
            // 保存到数据库
            orderTokenDetailRepository.save(orderTokenDetail);
            log.info("token绑定成功: token={}, tbShopName={}, tbShopId={}", token, tbShopName, tbShopId);
            return BindResult.success("激活码绑定成功", orderTokenDetailConverter.toDTO(orderTokenDetail));
        } catch (Exception e) {
            log.error("token绑定异常: token={}, tbShopName={}, tbShopId={}", token, tbShopName, tbShopId, e);
            return BindResult.fail("系统异常，绑定失败：" + e.getMessage());
        }
    }
    
    @Override
    public OrderTokenDetailDTO findActiveBindingByTbShopId(String tbShopId) {
        if (tbShopId == null) {
            return null;
        }
        // 查找该店铺所有绑定成功的记录，按绑定时间倒序排列
        List<OrderTokenDetail> bindings = orderTokenDetailRepository
                .findByTbShopIdAndStatusOrderByBindTimeDesc(tbShopId, TokenBindStatus.BOUND.name());
                
        if (bindings == null || bindings.isEmpty()) {
            // 没有找到任何绑定记录
            return null;
        }
        
        // 从最新的记录开始查找，找到第一个未过期的
        Date now = new Date();
        for (OrderTokenDetail detail : bindings) {
            // 如果过期时间为空或在当前时间之后，则认为是生效的
            if (detail.getExpireTime() == null || detail.getExpireTime().after(now)) {
                return orderTokenDetailConverter.toDTO(detail);
            }
        }
        
        // 所有绑定记录都已过期
        return null;
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