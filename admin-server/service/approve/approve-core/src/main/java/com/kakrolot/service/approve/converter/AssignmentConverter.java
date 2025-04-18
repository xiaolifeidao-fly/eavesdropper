package com.kakrolot.service.approve.converter;

import com.kakrolot.service.approve.api.dto.AssignmentDTO;
import com.kakrolot.service.approve.api.dto.QueryAssignmentConditionDTO;
import com.kakrolot.service.approve.dao.po.Assignment;
import com.kakrolot.service.approve.dao.po.QueryAssignmentCondition;
import com.kakrolot.service.common.convert.CommonConvert;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class AssignmentConverter extends CommonConvert<AssignmentDTO, Assignment> {

    public List<QueryAssignmentConditionDTO> queryDTOs(List<QueryAssignmentCondition> queryAssignmentConditions) {
        if (queryAssignmentConditions == null) {
            return Collections.emptyList();
        }
        return queryAssignmentConditions.stream().map(this::toQueryDTO).collect(Collectors.toList());
    }

    private QueryAssignmentConditionDTO toQueryDTO(QueryAssignmentCondition queryAssignmentCondition) {
        QueryAssignmentConditionDTO queryAssignmentConditionDTO = new QueryAssignmentConditionDTO();
        BeanUtils.copyProperties(queryAssignmentCondition, queryAssignmentConditionDTO);
        return queryAssignmentConditionDTO;
    }
}
