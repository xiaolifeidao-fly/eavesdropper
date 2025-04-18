package com.kakrolot.web.controller.impl;

import com.kakrolot.business.service.user.UserTenantService;
import com.kakrolot.common.utils.AmountUtils;
import com.kakrolot.common.utils.MD5;
import com.kakrolot.common.utils.RandomUtil;
import com.kakrolot.service.account.api.AccountService;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.account.api.dto.AccountStatus;
import com.kakrolot.service.tenant.api.TenantService;
import com.kakrolot.service.user.api.RoleService;
import com.kakrolot.service.user.api.UserService;
import com.kakrolot.service.user.api.dto.QueryUserDTO;
import com.kakrolot.service.user.api.dto.ResourceDTO;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.role.RoleWebConverter;
import com.kakrolot.web.convert.tenant.TenantWebConverter;
import com.kakrolot.web.convert.user.UserWebConverter;
import com.kakrolot.web.model.PageModel;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.user.*;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 卡卡用户管理
 */
@RestController
@RequestMapping("/users")
@Slf4j
public class UserController extends BaseController {

    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private UserWebConverter userWebConverter;

    @Autowired
    private TenantService tenantService;

    @Autowired
    private AccountService accountService;

    @Autowired
    private RoleWebConverter roleWebConverter;

    @Autowired
    private TenantWebConverter tenantWebConverter;

    @Autowired
    private UserTenantService userTenantService;

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "获取用户列表", httpMethod = "GET")
    public WebResponse<PageModel<QueryUserModel>> getUserList(UserModel userModel,
                                                              @RequestParam("page") int startIndex,
                                                              @RequestParam("limit") int pageSize,
                                                              @RequestParam("sort") String sort) {
        QueryUserDTO queryUserDTO = userWebConverter.toQueryUserDTO(userModel, startIndex, pageSize);
        Long count = userService.countByCondition(queryUserDTO);
        List<QueryUserModel> queryUserModelList = null;
        if (count > 0) {
            List<QueryUserDTO> userDTOList = userService.findByCondition(queryUserDTO);
            queryUserModelList = userDTOList.stream().map(userDTO1 -> {
                QueryUserModel userResponseModel = new QueryUserModel();
                userResponseModel.setId(userDTO1.getId());
                userResponseModel.setUsername(userDTO1.getUsername());
                userResponseModel.setOriginPassword(userDTO1.getOriginPassword());
                userResponseModel.setSecretKey(userDTO1.getSecretKey());
                try {
                    userResponseModel.setRoleModelList(roleWebConverter.toModels(roleService.findRolesByUserId(userDTO1.getId())));
                } catch (Exception e) {
                    e.printStackTrace();
                }
                try {
                    userResponseModel.setTenantModelList(tenantWebConverter.toModels(tenantService.findTenantByUserId(userDTO1.getId())));
                } catch (Exception e) {
                    e.printStackTrace();
                }
                userResponseModel.setBalanceAmount(userDTO1.getBalanceAmount());
                userResponseModel.setAccountStatus(AccountStatus.getDescByName(userDTO1.getAccountStatus()));
                userResponseModel.setAccountId(userDTO1.getAccountId());
                userResponseModel.setRemark(userDTO1.getRemark());
                return userResponseModel;
            }).collect(Collectors.toList());
        }
        return WebResponse.success(userWebConverter.toPageModel(queryUserModelList, count));

    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "添加用户", httpMethod = "POST")
    public WebResponse<String> save(@RequestBody UserModel userModel) {
        String username = userModel.getUsername();
        UserDTO dbUserDTO = userService.findByUsername(username);
        if (dbUserDTO != null) {
            return WebResponse.error("用户[" + username + "]已存在");
        }
        UserDTO userDTO = userWebConverter.toDTO(userModel);
        String password = RandomUtil.getRandomString(6);
        String md5Pass = MD5.toMD5(userDTO.getUsername() + "_" + password);
        userDTO.setPassword(md5Pass);
        userDTO.setOriginPassword(password);
        userDTO.setSecretKey(MD5.toMD5(UUID.randomUUID().toString()));
        UserDTO save = userService.save(userDTO);
        accountService.save(buildAccount(save));
        return WebResponse.success("用户[" + username + "]添加成功,密码为:[" + password + "]");
    }

    private AccountDTO buildAccount(UserDTO userDTO) {
        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setUserId(userDTO.getId());
        accountDTO.setAccountStatus(AccountStatus.ACTIVE.name());
        return accountDTO;
    }

    @RequestMapping(value = "/currentResources", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "获取用户资源菜单", httpMethod = "GET")
    public WebResponse<UserResourceModelResponse> getUserResources() {
        UserDTO userDTO = getCurrentUser();
        List<ResourceDTO> resourceDTOList = userService.findResourceByUserId(userDTO.getId());
        UserResourceModelResponse userResourceModelResponse = userWebConverter.buildUserResourceModelResponse(userDTO, resourceDTOList);
        return WebResponse.success(userResourceModelResponse);
    }

    @RequestMapping(value = "/{userId}/modifyPass", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "修改某用户密码", httpMethod = "POST")
    public WebResponse<String> modifyPass(@PathVariable("userId") Long userId, @RequestBody UserPassModel userPassModel) {
        UserDTO userDTO = userService.findById(userId);
        return modifyPass(userPassModel, userDTO);
    }

    @RequestMapping(value = "/{userId}/modifyRemark", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "修改某用户的备注", httpMethod = "POST")
    public WebResponse<String> modifyRemark(@PathVariable("userId") Long userId, @RequestBody UserRemarkModel userRemarkModel) {
        UserDTO userDTO = userService.findById(userId);
        return modifyRemark(userRemarkModel, userDTO);
    }

    private WebResponse<String> modifyRemark(UserRemarkModel userRemarkModel, UserDTO userDTO) {
        if (userDTO == null) {
            return WebResponse.error("用户不存在");
        }
        userDTO.setRemark(userRemarkModel.getRemark());
        userService.save(userDTO);
        return WebResponse.success("修改成功");
    }

    @RequestMapping(value = "/currentUser/modifyPass", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "修改个人密码", httpMethod = "POST")
    public WebResponse<String> modifyCurrentUserPass(@RequestBody UserPassModel userPassModel) {
        UserDTO userDTO = userService.findById(getCurrentUser().getId());
        return modifyPass(userPassModel, userDTO);
    }

    private WebResponse<String> modifyPass(UserPassModel userPassModel, UserDTO userDTO) {
        if (userDTO == null) {
            return WebResponse.error("用户不存在");
        }
        String md5OldPass = MD5.toMD5(userDTO.getUsername() + "_" + userPassModel.getOldPass());
        if (!userDTO.getPassword().equals(md5OldPass)) {
            return WebResponse.error("用户密码错误");
        }
        String md5NewPass = MD5.toMD5(userDTO.getUsername() + "_" + userPassModel.getNewPass());
        userDTO.setPassword(md5NewPass);
        userDTO.setOriginPassword(userPassModel.getNewPass());
        userService.save(userDTO);
        return WebResponse.success("修改成功");
    }

    @RequestMapping(value = "/{userId}/role/save", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "添加用户角色", httpMethod = "POST")
    public WebResponse<String> saveUserRole(@PathVariable(name = "userId") Long userId, @RequestBody UserRoleModel userRoleModel) {
        List<Long> roleIds = userRoleModel.getRoleIds();
        userService.saveUserRole(userId, roleIds);
        return WebResponse.success("添加成功");
    }

    @RequestMapping(value = "/{userId}/tenant/saveUserTenant", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "添加用户租户", httpMethod = "POST")
    public WebResponse<String> saveUserTenant(@PathVariable(name = "userId") Long userId, @RequestBody UserTenantModel userTenantModel) {
        List<Long> tenantIds = userTenantModel.getTenantIds();
        tenantService.saveTenantUser(tenantIds, userId);
        userTenantService.initAndGet(userId);
        return WebResponse.success("添加成功");
    }
}
