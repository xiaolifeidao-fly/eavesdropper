package com.kakrolot.business.service.user;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.kakrolot.redis.util.RedisUtil;
import com.kakrolot.service.user.api.UserService;
import com.kakrolot.service.user.api.dto.UserDTO;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class UserTokenService {

    @Autowired
    private RedisUtil redisUtil;

    private static final String USER_TOKEN_PRE = "KAKROLOT_USER_TOKEN_PRE_";

    private static final int EXPIRE_TIME = 2 * 60 * 60;

    @Autowired
    private UserService userService;

    public boolean exists(String token){
        String sessionKey = USER_TOKEN_PRE + "_" + token;
        return redisUtil.exists(sessionKey);
    }

    public UserDTO findUserByToken(String token) {
        String sessionKey = USER_TOKEN_PRE + "_" + token;
        String value = redisUtil.get(sessionKey);
        if (StringUtils.isBlank(value)) {
            return null;
        }
        return JSONObject.parseObject(value, UserDTO.class);
    }

    public String initAndGetToken(UserDTO userDTO) {
        String token = UUID.randomUUID().toString();
        String sessionKey = USER_TOKEN_PRE + "_" + token;
        redisUtil.setEx(sessionKey, JSONObject.toJSON(userDTO).toString(), EXPIRE_TIME);
        return token;
    }

    public void flushExpireTime(String token) {
        String sessionKey = USER_TOKEN_PRE + "_" + token;
        redisUtil.expire(sessionKey, EXPIRE_TIME);
    }

}
