package com.kakrolot.service.check.api;


import com.kakrolot.service.check.api.dto.*;

import java.util.List;

public interface CheckService {

    /**
     * 获取任务类目
     * @param userId
     * @return
     */
    List<TaskCategoryDTO> getTaskCategoryDTOList(Long userId);

    /**
     * 获取任务列表总量
     * @param queryTaskDTO
     * @return
     */
    Long countTaskByCondition(QueryTaskDTO queryTaskDTO);

    /**
     * 获取任务列表
     * @param queryTaskDTO
     * @return
     */
    List<TaskDTO> findTaskByCondition(QueryTaskDTO queryTaskDTO);

    /**
     * 获取用户任务详情总量
     * @param queryUserTaskDTO
     * @return
     */
    Long countUserTaskByCondition(QueryUserTaskDTO queryUserTaskDTO);

    /**
     * 获取用户任务详情
     * @param queryUserTaskDTO
     * @return
     */
    List<UserTaskDTO> findUserTaskByCondition(QueryUserTaskDTO queryUserTaskDTO);

    /**
     * 上传审核结果
     */
    void checkResult(UserTaskCheckDTO userTaskCheckDTO);

}
