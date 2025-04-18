package com.kakrolot.web.convert.check;

import com.kakrolot.service.check.api.dto.*;
import com.kakrolot.service.order.api.OrderRecordService;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.PageModel;
import com.kakrolot.web.model.check.*;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class CheckWebConvert extends WebConvert<TaskCategoryDTO, TaskCategoryModel> {

    @Autowired
    private OrderRecordService orderRecordService;

    private static Map<String,Long> shopIdMap;

    static {
        shopIdMap = new HashMap<>();
        shopIdMap.put("xhsLowFollowId",27L);
        shopIdMap.put("xhsCollectId",29L);
        shopIdMap.put("xhsLoveId",22L);
        shopIdMap.put("vxFollowId",39L);
        shopIdMap.put("vxCollectId",40L);
        shopIdMap.put("vxLoveId",38L);
    }

    public UserTaskCheckDTO toUserTaskCheckDTO(UserTaskCheckModel userTaskCheckModel) {
        UserTaskCheckDTO userTaskCheckDTO = new UserTaskCheckDTO();
        BeanUtils.copyProperties(userTaskCheckModel, userTaskCheckDTO);
        return userTaskCheckDTO;
    }

    public QueryUserTaskDTO toQueryUserTaskDTO(UserDTO userDTO, int startIndex, int pageSize,QueryUserTaskModel queryUserTaskModel) {
        QueryUserTaskDTO queryUserTaskDTO = new QueryUserTaskDTO();
        BeanUtils.copyProperties(queryUserTaskModel, queryUserTaskDTO);
        queryUserTaskDTO.setStartIndex(startIndex);
        queryUserTaskDTO.setPageSize(pageSize);
        return queryUserTaskDTO;
    }

    public QueryUserTaskDTO toQueryUserTaskDTOByHash(int startIndex, int pageSize,QueryUserTaskModel queryUserTaskModel) {
        QueryUserTaskDTO queryUserTaskDTO = new QueryUserTaskDTO();
        BeanUtils.copyProperties(queryUserTaskModel, queryUserTaskDTO);
        queryUserTaskDTO.setStartIndex(startIndex);
        queryUserTaskDTO.setPageSize(pageSize);
        String orderHash = queryUserTaskModel.getOrderHash();
        String xhsLowFollowId = queryUserTaskModel.getXhsLowFollowId();
        String xhsCollectId = queryUserTaskModel.getXhsCollectId();
        String xhsLoveId = queryUserTaskModel.getXhsLoveId();
        String vxFollowId = queryUserTaskModel.getVxFollowId();
        String vxCollectId = queryUserTaskModel.getVxCollectId();
        String vxLoveId = queryUserTaskModel.getVxLoveId();
        OrderRecordDTO orderRecordDTO = null;
        if(StringUtils.isNotBlank(orderHash)) {
            orderRecordDTO = orderRecordService.findByOrderHash(queryUserTaskModel.getOrderHash());
        }
        if(StringUtils.isNotBlank(xhsLowFollowId)) {
            orderRecordDTO = orderRecordService.findTopByShopIdAndBusinessIdOrderByCreateTimeDesc(shopIdMap.get("xhsLowFollowId"), xhsLowFollowId);
        }
        if(StringUtils.isNotBlank(xhsCollectId)) {
            orderRecordDTO = orderRecordService.findTopByShopIdAndBusinessIdOrderByCreateTimeDesc(shopIdMap.get("xhsCollectId"), xhsCollectId);
        }
        if(StringUtils.isNotBlank(xhsLoveId)) {
            orderRecordDTO = orderRecordService.findTopByShopIdAndBusinessIdOrderByCreateTimeDesc(shopIdMap.get("xhsLoveId"), xhsLoveId);
        }
        if(StringUtils.isNotBlank(vxFollowId)) {
            orderRecordDTO = orderRecordService.findTopByShopIdAndBusinessIdOrderByCreateTimeDesc(shopIdMap.get("vxFollowId"), vxFollowId);
        }
        if(StringUtils.isNotBlank(vxCollectId)) {
            orderRecordDTO = orderRecordService.findTopByShopIdAndBusinessIdOrderByCreateTimeDesc(shopIdMap.get("vxCollectId"), vxCollectId);
        }
        if(StringUtils.isNotBlank(vxLoveId)) {
            orderRecordDTO = orderRecordService.findTopByShopIdAndBusinessIdOrderByCreateTimeDesc(shopIdMap.get("vxLoveId"), vxLoveId);
        }
        queryUserTaskDTO.setOrderId(orderRecordDTO.getId());
        return queryUserTaskDTO;
    }

    public QueryTaskDTO toQueryTaskDTO(UserDTO userDTO, int startIndex, int pageSize, QueryTaskModel queryTaskModel) {
        QueryTaskDTO queryTaskDTO = new QueryTaskDTO();
        BeanUtils.copyProperties(queryTaskModel, queryTaskDTO);
        queryTaskDTO.setUserId(userDTO.getId());
        queryTaskDTO.setStartIndex(startIndex);
        queryTaskDTO.setPageSize(pageSize);
        return queryTaskDTO;
    }

    public TaskCategoryModel toTaskCategoryModel(TaskCategoryDTO taskCategoryDTO) {
        TaskCategoryModel taskCategoryModel = new TaskCategoryModel();
        BeanUtils.copyProperties(taskCategoryDTO, taskCategoryModel);
        return taskCategoryModel;
    }

    public List<TaskCategoryModel> toTaskCategoryModels(List<TaskCategoryDTO> taskCategoryDTOList) {
        if (CollectionUtils.isEmpty(taskCategoryDTOList)) {
            return Collections.emptyList();
        }
        return taskCategoryDTOList.stream().map(this::toTaskCategoryModel).collect(Collectors.toList());
    }

    public TaskModel toTaskModel(TaskDTO taskDTO) {
        TaskModel taskModel = new TaskModel();
        BeanUtils.copyProperties(taskDTO, taskModel);
        taskModel.setCreateTimeStr(com.kakrolot.common.utils.DateUtils
                .formatDate(com.kakrolot.common.utils.DateUtils.TimeType.yyyy_MM_ddHHmmSS,taskDTO.getCreateTime()));
        taskModel.setUpdateTimeStr(com.kakrolot.common.utils.DateUtils
                .formatDate(com.kakrolot.common.utils.DateUtils.TimeType.yyyy_MM_ddHHmmSS,taskDTO.getUpdateTime()));
        return taskModel;
    }

    public List<TaskModel> toTaskModels(List<TaskDTO> taskDTOList) {
        if (CollectionUtils.isEmpty(taskDTOList)) {
            return Collections.emptyList();
        }
        return taskDTOList.stream().map(this::toTaskModel).collect(Collectors.toList());
    }

    public PageModel<TaskModel> toTaskPageModel(Long count, List<TaskDTO> taskDTOList) {
        PageModel<TaskModel> pageModel = new PageModel<>();
        pageModel.setTotal(count);
        pageModel.setItems(toTaskModels(taskDTOList));
        return pageModel;
    }

    public UserTaskModel toUserTaskModel(UserTaskDTO userTaskDTO) {
        UserTaskModel userTaskModel = new UserTaskModel();
        BeanUtils.copyProperties(userTaskDTO, userTaskModel);
        return userTaskModel;
    }

    public List<UserTaskModel> toUserTaskModels(List<UserTaskDTO> userTaskDTOList) {
        if (CollectionUtils.isEmpty(userTaskDTOList)) {
            return Collections.emptyList();
        }
        return userTaskDTOList.stream().map(this::toUserTaskModel).collect(Collectors.toList());
    }

    public PageModel<UserTaskModel> toUserTaskPageModel(Long count, List<UserTaskDTO> userTaskDTOList) {
        PageModel<UserTaskModel> pageModel = new PageModel<>();
        pageModel.setTotal(count);
        pageModel.setItems(toUserTaskModels(userTaskDTOList));
        return pageModel;
    }


}
