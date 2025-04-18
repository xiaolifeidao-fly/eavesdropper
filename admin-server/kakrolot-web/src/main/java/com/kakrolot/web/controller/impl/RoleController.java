package com.kakrolot.web.controller.impl;

import com.kakrolot.common.utils.Constant;
import com.kakrolot.service.user.api.RoleService;
import com.kakrolot.service.user.api.dto.RoleDTO;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.role.RoleWebConverter;
import com.kakrolot.web.convert.user.UserWebConverter;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.role.RoleModel;
import com.kakrolot.web.model.role.RoleModelResponse;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@Slf4j
public class RoleController extends BaseController {

    @Autowired
    private UserWebConverter userWebConverter;

    @Autowired
    private RoleWebConverter roleWebConverter;

    @Autowired
    private RoleService roleService;

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "获取角色列表", httpMethod = "GET")
    public WebResponse<RoleModelResponse> getUserResources(@RequestParam("roleName") String roleName,
                                                           @RequestParam("page") Integer page,
                                                           @RequestParam("limit") Integer limit,
                                                           @RequestParam("sort") String sort) {
        List<RoleDTO> roleDTOList = roleService.findAllRolesByActive(Constant.ACTIVE);
        List<RoleModel> roleModelList = roleWebConverter.toModels(roleDTOList);
        RoleModelResponse roleModelResponse = RoleModelResponse.builder().items(roleModelList).total(roleModelList.size()).build();
        return WebResponse.success(roleModelResponse);
    }

}
