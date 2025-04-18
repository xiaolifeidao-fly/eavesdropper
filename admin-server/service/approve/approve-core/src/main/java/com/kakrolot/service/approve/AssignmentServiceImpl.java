package com.kakrolot.service.approve;

import com.kakrolot.service.approve.api.AssignmentService;
import com.kakrolot.service.approve.api.dto.AssignmentDTO;
import com.kakrolot.service.approve.api.dto.QueryAssignmentConditionDTO;
import com.kakrolot.service.approve.converter.AssignmentConverter;
import com.kakrolot.service.approve.dao.po.Assignment;
import com.kakrolot.service.approve.dao.po.QueryAssignmentCondition;
import com.kakrolot.service.approve.dao.repository.AssignmentRepository;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentConverter assignmentConverter;

    @Override
    public void save(AssignmentDTO assignmentDTO) {
        Assignment assignment = assignmentConverter.toPo(assignmentDTO);
        assignmentRepository.save(assignment);
    }

    @Override
    public Long countByCondition(QueryAssignmentConditionDTO queryAssignmentConditionDTO) {
        StringBuilder sql = new StringBuilder();
        sql.append("select count(1) ")
                .append("from assignment a left join order_record o on a.order_id = o.id ")
                .append("where a.active = 1 ");
        sql.append(buildWhereSql(queryAssignmentConditionDTO));
        Map<String, Object> params = buildWhereParams(queryAssignmentConditionDTO);
        return assignmentRepository.countByCondition(sql.toString(), params);
    }

    private Map<String, Object> buildWhereParams(QueryAssignmentConditionDTO queryAssignmentConditionDTO) {
        Map<String, Object> params = new HashMap<>();
        String url = queryAssignmentConditionDTO.getUrl();
        if (StringUtils.isNotBlank(url)) {
            params.put("url", url);
        }
        Long userId = queryAssignmentConditionDTO.getUserId();
        if (userId != null) {
            params.put("userId", userId);
        }
        String approveStatus = queryAssignmentConditionDTO.getApproveStatus();
        if (StringUtils.isNotBlank(approveStatus)) {
            params.put("approveStatus", approveStatus);
        }
        Long shopId = queryAssignmentConditionDTO.getShopId();
        if (shopId != null) {
            params.put("shopId", shopId);
        }
        return params;
    }

    private String buildWhereSql(QueryAssignmentConditionDTO queryAssignmentConditionDTO) {
        String url = queryAssignmentConditionDTO.getUrl();
        StringBuilder where = new StringBuilder();
        if (StringUtils.isNotBlank(url)) {
            where.append(" and o.tiny_url = :url");
        }
        Long userId = queryAssignmentConditionDTO.getUserId();
        if (userId != null) {
            where.append(" and a.user_id = :userId");
        }
        String approveStatus = queryAssignmentConditionDTO.getApproveStatus();
        if (StringUtils.isNotBlank(approveStatus)) {
            where.append(" and a.approve_status = :approveStatus");
        }
        Long shopId = queryAssignmentConditionDTO.getShopId();
        if (shopId != null) {
            where.append(" and o.shop_id = :shopId");
        }
        return where.toString();
    }

    @Override
    public List<QueryAssignmentConditionDTO> queryByCondition(QueryAssignmentConditionDTO queryAssignmentConditionDTO) {
        StringBuilder sql = new StringBuilder();
        sql.append("select a.*,o.tiny_url as url, o.order_num as total_num, (o.end_num - o.init_num) as fact_num, o.order_hash as order_hash, o.order_status as order_status ")
                .append("from assignment a left join order_record o on a.order_id = o.id ")
                .append("where a.active = 1 ");
        sql.append(buildWhereSql(queryAssignmentConditionDTO));
        Map<String, Object> params = buildWhereParams(queryAssignmentConditionDTO);
        List<QueryAssignmentCondition> queryAssignmentConditions = assignmentRepository.findByCondition(sql.toString(), queryAssignmentConditionDTO.getStartIndex(), queryAssignmentConditionDTO.getPageSize(), params, QueryAssignmentCondition.class);
        return assignmentConverter.queryDTOs(queryAssignmentConditions);
    }

    @Override
    public Long countByOrderIdAndUserId(Long orderId, Long userId) {
        return assignmentRepository.countByOrderIdAndUserId(orderId, userId);
    }

    @Override
    public AssignmentDTO findById(Long assignmentId) {
        Assignment assignment = assignmentRepository.getById(assignmentId);
        if (assignment == null) {
            return null;
        }
        return assignmentConverter.toDTO(assignment);
    }

}
