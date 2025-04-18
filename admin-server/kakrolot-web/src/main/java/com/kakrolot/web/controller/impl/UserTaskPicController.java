package com.kakrolot.web.controller.impl;

import com.kakrolot.service.check.api.CheckService;
import com.kakrolot.service.check.api.dto.QueryUserTaskDTO;
import com.kakrolot.service.check.api.dto.UserTaskDTO;
import com.kakrolot.web.auth.annotations.Auth;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.check.CheckWebConvert;
import com.kakrolot.web.model.PageModel;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.check.QueryUserTaskModel;
import com.kakrolot.web.model.check.UserTaskModel;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/userTask")
@Slf4j
public class UserTaskPicController extends BaseController {

    @Autowired
    private CheckService checkService;

    @Autowired
    private CheckWebConvert checkWebConvert;


    @RequestMapping(value = "/picList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "任务执行图:所有图片数据", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<PageModel<UserTaskModel>> picList(QueryUserTaskModel queryUserTaskModel,
                                                          @RequestParam("page") int startIndex,
                                                          @RequestParam("limit") int pageSize,
                                                          @RequestParam("sort") String sort) {
        QueryUserTaskDTO queryUserTaskDTO = checkWebConvert.toQueryUserTaskDTOByHash(startIndex,pageSize,queryUserTaskModel);
        Long count = checkService.countUserTaskByCondition(queryUserTaskDTO);
        List<UserTaskDTO> userTaskDTOList = checkService.findUserTaskByCondition(queryUserTaskDTO);
        return WebResponse.success(checkWebConvert.toUserTaskPageModel(count, userTaskDTOList));
    }


}
