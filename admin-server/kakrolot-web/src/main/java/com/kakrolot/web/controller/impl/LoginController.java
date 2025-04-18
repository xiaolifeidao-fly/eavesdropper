package com.kakrolot.web.controller.impl;

import com.kakrolot.business.service.user.UserTokenService;
import com.kakrolot.common.utils.AmountUtils;
import com.kakrolot.common.utils.MD5;
import com.kakrolot.redis.util.RedisUtil;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.account.api.dto.AccountLockKey;
import com.kakrolot.service.user.api.UserLoginRecordService;
import com.kakrolot.service.user.api.UserService;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.service.user.api.dto.UserLoginRecordDTO;
import com.kakrolot.service.user.api.dto.UserStatus;
import com.kakrolot.web.auth.annotations.Auth;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.account.AccountModel;
import com.kakrolot.web.model.user.LoginModel;
import com.kakrolot.web.model.user.LoginResponse;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/login")
@Slf4j
public class LoginController extends BaseController {

    @Autowired
    private UserService userService;

    @Autowired
    private RedisUtil redisUtil;

    @Value("${user.max.login.error.num:20}")
    private Long loginErrorNum;

    @Autowired
    private UserTokenService userTokenService;

    @Autowired
    private UserLoginRecordService userLoginRecordService;

    @RequestMapping(value = "", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "登录", httpMethod = "POST")
    @Auth(isIntercept = false)
    public WebResponse<LoginResponse> login(@RequestBody LoginModel loginModel) {
        String ip = getRemoteIp();
        if (isLimit(ip)) {
            return WebResponse.error("用户密码错误次数太多,请一小时后再试");
        }
        String username = loginModel.getUsername();
        UserDTO userDTO = userService.findByUsername(loginModel.getUsername());
        if (userDTO == null) {
            calLoginError(ip);
            log.warn("login fault by userName {}", username);
            return WebResponse.error("用户名或密码错误");
        }
        if (!UserStatus.ACTIVE.name().equals(userDTO.getStatus())) {
            log.warn("userName {} is not active", username);
            return WebResponse.error("该用户已被封禁");
        }
        String md5Pass = getMdsPass(loginModel);
        if (!StringUtils.equals(md5Pass, userDTO.getPassword())) {
            log.warn("login fault by userName and password {}", username);
            calLoginError(ip);
            return WebResponse.error("用户名或密码错误");
        }
        saveLoginUserRecord(userDTO, ip);
        String token = userTokenService.initAndGetToken(userDTO);
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(token);
        return WebResponse.success(loginResponse);
    }

    private void saveLoginUserRecord(UserDTO userDTO, String ip) {
        UserLoginRecordDTO userLoginRecordDTO = new UserLoginRecordDTO();
        userLoginRecordDTO.setIp(ip);
        userLoginRecordDTO.setUserId(userDTO.getId());
        userLoginRecordService.save(userLoginRecordDTO);
    }

    private String getMdsPass(LoginModel loginModel) {
        String pass = loginModel.getUsername() + "_" + loginModel.getPassword();
        return MD5.toMD5(pass);
    }

    private boolean isLimit(String ip) {
        String ipKey = buildIpKey(ip);
        String value = redisUtil.get(ipKey);
        if (StringUtils.isBlank(value)) {
            return false;
        }
        long errorNum = Long.parseLong(value);
        return errorNum > loginErrorNum;
    }

    private String buildIpKey(String ip) {
        return "Kakrolot_user_ip_login_" + ip;
    }

    private void calLoginError(String ip) {
        String ipKey = buildIpKey(ip);
        redisUtil.incr(ipKey);
        redisUtil.expire(ipKey, 60 * 60);
    }

}
