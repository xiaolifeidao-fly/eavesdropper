package com.kakrolot.web.controller.impl;

import com.kakrolot.service.user.api.UserDetailService;
import com.kakrolot.service.user.api.dto.UserDetailDTO;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.userDetail.UserDetailWebConverter;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.userDetail.UserDetailModel;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * barry用户管理
 */
@RestController
@RequestMapping("/userDetail")
@Slf4j
public class UserDetailController extends BaseController {

    @Autowired
    private UserDetailService userDetailService;

    @Autowired
    private UserDetailWebConverter userDetailWebConverter;

    //用户详情
    @RequestMapping(value = "/find", method = RequestMethod.GET)
    @ResponseBody
    public WebResponse<UserDetailModel> find(@RequestParam("username") String username) {
        if(StringUtils.isBlank(username)) {
            return WebResponse.error("用户名不能为空");
        }
        UserDetailDTO userDetailDTO = userDetailService.findByUserName(username);
        UserDetailModel userDetailModel = userDetailWebConverter.toModel(userDetailDTO);
        return WebResponse.success(userDetailModel);
    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "添加用户", httpMethod = "POST")
    public WebResponse<String> save(@RequestBody UserDetailModel userDetailModel) {
        UserDetailDTO userDetailDTO = userDetailWebConverter.toDTO(userDetailModel);
        userDetailService.saveUserDetail(userDetailDTO);
        return WebResponse.success("添加成功");
    }

    @RequestMapping(value = "/update", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "更新用户", httpMethod = "POST")
    public WebResponse<String> update(@RequestBody UserDetailModel userDetailModel) {
        UserDetailDTO userDetailDTO = userDetailWebConverter.toDTO(userDetailModel);
        userDetailService.updateUserDetail(userDetailDTO);
        return WebResponse.success("更新成功");
    }

}
