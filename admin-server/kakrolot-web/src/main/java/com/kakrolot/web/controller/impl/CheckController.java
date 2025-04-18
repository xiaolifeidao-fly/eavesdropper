package com.kakrolot.web.controller.impl;

import com.kakrolot.service.approve.api.AssignmentService;
import com.kakrolot.service.approve.api.UserTaskApproveService;
import com.kakrolot.service.approve.api.dto.ApproveStatus;
import com.kakrolot.service.approve.api.dto.AssignmentDTO;
import com.kakrolot.service.approve.api.dto.UserApproveStatus;
import com.kakrolot.service.check.api.CheckService;
import com.kakrolot.service.check.api.dto.*;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.check.CheckWebConvert;
import com.kakrolot.web.model.PageModel;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.check.*;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/check")
@Slf4j
public class CheckController extends BaseController {

    @Autowired
    private CheckService checkService;

    @Autowired
    private CheckWebConvert checkWebConvert;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private UserTaskApproveService userTaskApproveService;

    @RequestMapping(value = "/currentTaskCategoryList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "当前登录用户能看到的任务类目列表", httpMethod = "GET")
    public WebResponse<List<TaskCategoryModel>> currentTaskCategoryList() {
        UserDTO userDTO = getCurrentUser();
        List<TaskCategoryDTO> taskCategoryDTOList = checkService.getTaskCategoryDTOList(userDTO.getId());
        return WebResponse.success(checkWebConvert.toTaskCategoryModels(taskCategoryDTOList));
    }

    @RequestMapping(value = "/taskList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "任务列表", httpMethod = "GET")
    public WebResponse<PageModel<TaskModel>> taskList(QueryTaskModel queryTaskModel,
                                                      @RequestParam("page") int startIndex,
                                                      @RequestParam("limit") int pageSize,
                                                      @RequestParam("sort") String sort) {
        UserDTO userDTO = getCurrentUser();
        QueryTaskDTO queryTaskDTO = checkWebConvert.toQueryTaskDTO(userDTO,startIndex,pageSize,queryTaskModel);
        Long count = checkService.countTaskByCondition(queryTaskDTO);
        List<TaskDTO> taskDTOList = checkService.findTaskByCondition(queryTaskDTO);
        return WebResponse.success(checkWebConvert.toTaskPageModel(count, taskDTOList));
    }



    @RequestMapping(value = "/userTaskList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "用户任务情况", httpMethod = "GET")
    public WebResponse<PageModel<UserTaskModel>> taskList(QueryUserTaskModel queryUserTaskModel,
                                                          @RequestParam("page") int startIndex,
                                                          @RequestParam("limit") int pageSize,
                                                          @RequestParam("sort") String sort) {
        UserDTO userDTO = getCurrentUser();
        QueryUserTaskDTO queryUserTaskDTO = checkWebConvert.toQueryUserTaskDTO(userDTO,startIndex,pageSize,queryUserTaskModel);
        Long count = checkService.countUserTaskByCondition(queryUserTaskDTO);
        List<UserTaskDTO> userTaskDTOList = checkService.findUserTaskByCondition(queryUserTaskDTO);
        return WebResponse.success(checkWebConvert.toUserTaskPageModel(count, userTaskDTOList));
    }

    @RequestMapping(value = "/result", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "审核结果上传", httpMethod = "POST")
    public WebResponse<String> saveCheckResult(@RequestBody UserTaskCheckModel userTaskCheckModel) {
        UserTaskCheckDTO userTaskCheckDTO = checkWebConvert.toUserTaskCheckDTO(userTaskCheckModel);
        checkService.checkResult(userTaskCheckDTO);
        return WebResponse.success("审核结果上传成功");
    }

    @RequestMapping(value = "/{assignmentId}/finish", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "完结", httpMethod = "POST")
    public WebResponse<String> finishAssignment(@PathVariable("assignmentId") Long assignmentId) {
        AssignmentDTO assignmentDTO = assignmentService.findById(assignmentId);
        Long orderId = assignmentDTO.getOrderId();
        Long count = userTaskApproveService.countUserApproveTasksByOrderId(orderId, Collections.singletonList(UserApproveStatus.WAIT));
        if(count > 0){
            return WebResponse.error("未审核完毕,不能完结");
        }
        assignmentDTO.setApproveStatus(ApproveStatus.FINISH.name());
        assignmentService.save(assignmentDTO);
        return WebResponse.success("单子已完结");
    }

}
