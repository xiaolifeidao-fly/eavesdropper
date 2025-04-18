package com.kakrolot.service.check;

import com.kakrolot.service.approve.api.AssignmentService;
import com.kakrolot.service.approve.api.ShopApproveUserService;
import com.kakrolot.service.approve.api.UserTaskApproveService;
import com.kakrolot.service.approve.api.dto.*;
import com.kakrolot.service.check.api.CheckService;
import com.kakrolot.service.check.api.dto.*;
import com.kakrolot.service.order.api.dto.OrderStatus;
import com.kakrolot.service.shop.api.ShopService;
import com.kakrolot.service.shop.api.dto.ShopDTO;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CheckServiceImpl implements CheckService {

    @Autowired
    private ShopApproveUserService shopApproveUserService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private ShopService shopService;

    @Autowired
    private UserTaskApproveService userTaskApproveService;

    @Override
    public List<TaskCategoryDTO> getTaskCategoryDTOList(Long userId) {
        /*TaskCategoryDTO taskCategoryDTO1 = TaskCategoryDTO.builder().shopId(1L).name("dy-加入粉丝团").code("DY_JOIN_FANS").build();
        taskCategoryDTO1.setId(1L);
        TaskCategoryDTO taskCategoryDTO2 = TaskCategoryDTO.builder().shopId(2L).name("投票").code("VOTE").build();
        taskCategoryDTO2.setId(2L);
        TaskCategoryDTO taskCategoryDTO3 = TaskCategoryDTO.builder().shopId(3L).name("tb-店铺收藏").code("TB_STORE_COLLECT").build();
        taskCategoryDTO3.setId(3L);
        List<TaskCategoryDTO> taskCategoryDTOList = new ArrayList<>();
        taskCategoryDTOList.add(taskCategoryDTO1);
        taskCategoryDTOList.add(taskCategoryDTO2);
        taskCategoryDTOList.add(taskCategoryDTO3);
        return taskCategoryDTOList;*/
        List<TaskCategoryDTO> taskCategoryDTOList = new ArrayList<>();
        List<ShopApproveUserDTO> shopApproveUserDTOList = shopApproveUserService.getByUserId(userId);
        if (CollectionUtils.isNotEmpty(shopApproveUserDTOList)) {
            taskCategoryDTOList = shopApproveUserDTOList.stream().map(shopApproveUserDTO -> {
                TaskCategoryDTO taskCategoryDTO = new TaskCategoryDTO();
                Long shopId = shopApproveUserDTO.getShopId();
                ShopDTO shopDTO = shopService.findById(shopId);
                taskCategoryDTO.setShopId(shopId);
                taskCategoryDTO.setCode(shopDTO.getCode());
                taskCategoryDTO.setName(shopDTO.getName());
                taskCategoryDTO.setApproveType(shopApproveUserDTO.getApproveType());
                return taskCategoryDTO;
            }).collect(Collectors.toList());
        }
        return taskCategoryDTOList;
    }

    QueryAssignmentConditionDTO toQueryAssignmentConditionDTO(QueryTaskDTO queryTaskDTO) {
        QueryAssignmentConditionDTO queryAssignmentConditionDTO = new QueryAssignmentConditionDTO();
        queryAssignmentConditionDTO.setShopId(queryTaskDTO.getShopId());
        queryAssignmentConditionDTO.setUrl(queryTaskDTO.getTaskContent());
        queryAssignmentConditionDTO.setUserId(queryTaskDTO.getUserId());
        queryAssignmentConditionDTO.setPageSize(queryTaskDTO.getPageSize());
        queryAssignmentConditionDTO.setStartIndex(queryTaskDTO.getStartIndex());
        if (StringUtils.isBlank(queryTaskDTO.getApproveStatus())) {
            queryAssignmentConditionDTO.setApproveStatus(ApproveStatus.CHECKING.name());
        } else {
            queryAssignmentConditionDTO.setApproveStatus(queryTaskDTO.getApproveStatus());
        }
        return queryAssignmentConditionDTO;
    }

    @Override
    public Long countTaskByCondition(QueryTaskDTO queryTaskDTO) {
        return assignmentService.countByCondition(toQueryAssignmentConditionDTO(queryTaskDTO));
    }

    @Override
    public List<TaskDTO> findTaskByCondition(QueryTaskDTO queryTaskDTO) {
        /*TaskDTO taskDTO1 = TaskDTO.builder().shopId(queryTaskDTO.getShopId()).orderRecordId(1L).taskInstanceId(1L).shopCategoryName("测试任务1").taskContent("http://www.taobao.com快来收藏我")
                .orderNum(1000L).initNum(42L).endNum(542L).waitNum(300L).doneNum(100L).errorNum(200L).orderStatus("PENDING").orderStatusShow("进行中").build();
        TaskDTO taskDTO2 = TaskDTO.builder().shopId(queryTaskDTO.getShopId()).orderRecordId(2L).taskInstanceId(2L).shopCategoryName("测试任务2").taskContent("http://www.taobao.com快来收藏我")
                .orderNum(500L).initNum(2L).endNum(72L).waitNum(30L).doneNum(20L).errorNum(20L).orderStatus("PENDING").orderStatusShow("进行中").build();
        TaskDTO taskDTO3 = TaskDTO.builder().shopId(queryTaskDTO.getShopId()).orderRecordId(3L).taskInstanceId(3L).shopCategoryName("测试任务3").taskContent("http://www.taobao.com快来收藏我")
                .orderNum(300L).initNum(400L).endNum(500L).waitNum(100L).doneNum(0L).errorNum(0L).orderStatus("PENDING").orderStatusShow("进行中").build();
        List<TaskDTO> taskDTOList = new ArrayList<>();
        if(queryTaskDTO.getShopId() == 1) {
            taskDTO1.setShopCategoryName("粉丝团任务1");
            taskDTO2.setShopCategoryName("粉丝团任务2");
            taskDTO3.setShopCategoryName("粉丝团任务3");
        }
        if(queryTaskDTO.getShopId() == 2) {
            taskDTO1.setShopCategoryName("投票1");
            taskDTO2.setShopCategoryName("投票2");
            taskDTO3.setShopCategoryName("投票3");
        }
        if(queryTaskDTO.getShopId() == 3) {
            taskDTO1.setShopCategoryName("tb收藏任务0");
            taskDTO2.setShopCategoryName("tb收藏任务1");
            taskDTO3.setShopCategoryName("tb收藏任务2");
        }
        taskDTOList.add(taskDTO1);
        taskDTOList.add(taskDTO2);
        taskDTOList.add(taskDTO3);*/
        List<TaskDTO> taskDTOList = new ArrayList<>();
        List<QueryAssignmentConditionDTO> queryAssignmentConditionList = assignmentService.queryByCondition(toQueryAssignmentConditionDTO(queryTaskDTO));
        if (CollectionUtils.isNotEmpty(queryAssignmentConditionList)) {
            taskDTOList = queryAssignmentConditionList.stream().map(queryAssignmentConditionDTO -> {
                //TODO bladeId kkaId等
                TaskDTO taskDTO = new TaskDTO();
                taskDTO.setId(queryAssignmentConditionDTO.getId());
                taskDTO.setOrderRecordId(queryAssignmentConditionDTO.getOrderId());
                taskDTO.setOrderHash(queryAssignmentConditionDTO.getOrderHash());
                taskDTO.setTaskContent(queryAssignmentConditionDTO.getUrl());
                taskDTO.setOrderNum(queryAssignmentConditionDTO.getTotalNum());
                taskDTO.setDoneNum(queryAssignmentConditionDTO.getFactNum());
                taskDTO.setApproveStatus(queryAssignmentConditionDTO.getApproveStatus());
                taskDTO.setApproveStatusShow(ApproveStatus.valueOf(queryAssignmentConditionDTO.getApproveStatus()).getDesc());
                taskDTO.setCreateTime(queryAssignmentConditionDTO.getCreateTime());
                taskDTO.setCreateBy(queryAssignmentConditionDTO.getCreateBy());
                taskDTO.setUpdateTime(queryAssignmentConditionDTO.getUpdateTime());
                taskDTO.setUpdateBy(queryAssignmentConditionDTO.getUpdateBy());
                taskDTO.setOrderStatus(queryAssignmentConditionDTO.getOrderStatus());
                taskDTO.setOrderStatusShow(OrderStatus.valueOf(queryAssignmentConditionDTO.getOrderStatus()).getDesc());
                return taskDTO;
            }).collect(Collectors.toList());
        }
        return taskDTOList;
    }

    @Override
    public Long countUserTaskByCondition(QueryUserTaskDTO queryUserTaskDTO) {
        return userTaskApproveService.countUserApproveTasksByOrderId(queryUserTaskDTO.getOrderId(), Collections.singletonList(UserApproveStatus.getEnumByName(queryUserTaskDTO.getStatus())));
    }

    @Override
    public List<UserTaskDTO> findUserTaskByCondition(QueryUserTaskDTO queryUserTaskDTO) {
        /*UserTaskDTO userTaskDTO1 = UserTaskDTO.builder().taskInstanceId(6L).status("WAIT").statusShow("审核中").userId(123L).userSource("zz")
                .picUrl("https://kakabang-android.oss-cn-hangzhou.aliyuncs.com/-23f70cce05d88c81.jpg").build();
        userTaskDTO1.setId(1L);
        UserTaskDTO userTaskDTO2 = UserTaskDTO.builder().taskInstanceId(6L).status("WAIT").statusShow("审核中").userId(12L).userSource("zz")
                .picUrl("https://kakabang-android.oss-cn-hangzhou.aliyuncs.com/1590823688919.png").build();
        userTaskDTO2.setId(2L);
        UserTaskDTO userTaskDTO3 = UserTaskDTO.builder().taskInstanceId(6L).status("WAIT").statusShow("审核中").userId(23L).userSource("zz")
                .picUrl("https://kakabang-android.oss-cn-hangzhou.aliyuncs.com/1593004246864.png").build();
        userTaskDTO3.setId(3L);
        UserTaskDTO userTaskDTO4 = UserTaskDTO.builder().taskInstanceId(7L).status("WAIT").statusShow("审核中").userId(23L).userSource("zz")
                .picUrl("http://kakabang-android.oss-cn-hangzhou.aliyuncs.com/Screenshot_20200704-172835_.png").build();
        userTaskDTO4.setId(4L);
        List<UserTaskDTO> userTaskDTOList = new ArrayList<>();
        for(int i=0;i<10;i++){
            userTaskDTOList.add(userTaskDTO1);
            userTaskDTOList.add(userTaskDTO2);
            userTaskDTOList.add(userTaskDTO3);
            userTaskDTOList.add(userTaskDTO4);
        }
        return userTaskDTOList;*/
        List<UserTaskDTO> userTaskDTOList = new ArrayList<>();
        List<UserApproveTaskDTO> userApproveTaskList = userTaskApproveService.findUserApproveTasksByOrderId(queryUserTaskDTO.getOrderId(), Collections.singletonList(UserApproveStatus.getEnumByName(queryUserTaskDTO.getStatus())),
                queryUserTaskDTO.getStartIndex(), queryUserTaskDTO.getPageSize());
        if (CollectionUtils.isNotEmpty(userApproveTaskList)) {
            userTaskDTOList = userApproveTaskList.stream().map(userApproveTaskDTO -> {
                UserTaskDTO userTaskDTO = new UserTaskDTO();
                userTaskDTO.setOrderId(userApproveTaskDTO.getOrderId());
                userTaskDTO.setUserTaskId(userApproveTaskDTO.getUserTaskId());
                userTaskDTO.setStatus(userApproveTaskDTO.getStatus());
                userTaskDTO.setPicUrl(userApproveTaskDTO.getImageUrl());
                return userTaskDTO;
            }).collect(Collectors.toList());
        }
        return userTaskDTOList;
    }

    @Override
    public void checkResult(UserTaskCheckDTO userTaskCheckDTO) {
        userTaskApproveService.approve(userTaskCheckDTO.getUserTaskIds(), UserApproveStatus.getEnumByName(userTaskCheckDTO.getResult()));
    }
}
