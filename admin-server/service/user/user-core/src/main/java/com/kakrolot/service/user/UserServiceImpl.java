package com.kakrolot.service.user;

import com.kakrolot.common.utils.Constant;
import com.kakrolot.redis.util.RedisUtil;
import com.kakrolot.service.user.api.ResourceService;
import com.kakrolot.service.user.api.UserService;
import com.kakrolot.service.user.api.dto.QueryUserDTO;
import com.kakrolot.service.user.api.dto.ResourceDTO;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.service.user.convert.UserConverter;
import com.kakrolot.service.user.convert.UserRoleConverter;
import com.kakrolot.service.user.dao.po.QueryUser;
import com.kakrolot.service.user.dao.po.User;
import com.kakrolot.service.user.dao.po.UserRole;
import com.kakrolot.service.user.dao.repository.UserRepository;
import com.kakrolot.service.user.dao.repository.UserRoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private UserConverter userConverter;

    @Autowired
    private UserRoleConverter userRoleConverter;

    @Value("${blade.job.task.case.process.readNum:5000}")
    private int RESOURCE_EXPIRE_TIME = 24 * 60 * 60 * 5;

    @Override
    public UserDTO findByUsername(String username) {
        User user = userRepository.findByUsername(username);
        return userConverter.toDTO(user);
    }

    @Override
    public UserDTO findByPubToken(String pubToken) {
        User user = userRepository.findByPubToken(pubToken);
        return userConverter.toDTO(user);
    }

    @Override
    public UserDTO save(UserDTO userDTO) {
        User user = userConverter.toPo(userDTO);
        userRepository.save(user);
        return userConverter.toDTO(user);
    }

    @Override
    public List<UserDTO> findAllUserByActive(Boolean active) {
        List<User> userList = userRepository.findAllByActive(active);
        return userConverter.toDTOs(userList);
    }

    @Override
    @Transactional
    public void saveUserRole(Long userId, List<Long> roleIds) {
        //删除role和user对应的关系
        String key1 = "ROLES_USERID_"+userId;
        redisUtil.del(key1);
        //删除role和user组合的string
        String key = buildUserRoleKey(userId);
        redisUtil.del(key);
        userRoleRepository.deleteByUserId(userId);
        if (roleIds == null || roleIds.size() == 0) {
            return;
        }
        for (Long roleId : roleIds) {
            UserRole userRole = new UserRole();
            userRole.setRoleId(roleId);
            userRole.setUserId(userId);
            userRole.setActive(Constant.ACTIVE);
            userRoleRepository.save(userRole);
        }
        initRoleIds(key, roleIds);
    }

    public void initRoleIds(String key, List<Long> roleIds) {
        StringBuffer roleIdStr = new StringBuffer();
        for (Long roleId : roleIds) {
            roleIdStr.append(roleId + ",");
        }
        redisUtil.set(key, roleIdStr.deleteCharAt(roleIdStr.length() - 1).toString());
    }

    private String buildUserRoleKey(Long userId) {
        return "KAKROLOT_USER_ROLE_PRE_KEY_" + userId;
    }

    @Override
    public List<Long> findRoleIdsByUserId(Long userId) {
        String key = buildUserRoleKey(userId);
        String value = redisUtil.get(key);
        if (StringUtils.isBlank(value)) {
            value = userRoleRepository.findByUserId(userId).stream().map(userRole ->
                    String.valueOf(userRole.getRoleId())).collect(Collectors.joining(","));
            redisUtil.setEx(key,value,RESOURCE_EXPIRE_TIME);
        }
        List<Long> roleIds = new ArrayList<>();
        String[] roleIdArray = value.split(",");
        for (String roleId : roleIdArray) {
            roleIds.add(Long.valueOf(roleId));
        }
        return roleIds;
    }

    @Override
    public List<ResourceDTO> findResourceByUserId(Long userId) {
        List<Long> roleIds = findRoleIdsByUserId(userId);
        return resourceService.findByRoleIds(roleIds);
    }

    @Override
    public Long countByCondition(QueryUserDTO queryUserDTO) {
        StringBuffer sql = new StringBuffer();
        sql.append("select count(1) ")
                .append("from user u ")
                .append("left join account a on a.user_id = u.id ")
                .append("where u.active = 1 ");
        fillWhere(queryUserDTO, sql);
        Map<String, Object> map = buildParams(queryUserDTO);
        return userRepository.countByCondition(sql.toString(), map);
    }

    private void fillWhere(QueryUserDTO queryUserDTO, StringBuffer sql) {
        if (StringUtils.isNotBlank(queryUserDTO.getUsername())) {
            sql.append(" and u.username like :username ");
        }
    }

    private Map<String, Object> buildParams(QueryUserDTO queryUserDTO) {
        Map<String, Object> params = new HashMap<>();
        if (StringUtils.isNotBlank(queryUserDTO.getUsername())) {
            params.put("username", "%" + queryUserDTO.getUsername() + "%");
        }
        return params;
    }

    @Override
    public List<QueryUserDTO> findByCondition(QueryUserDTO queryUserDTO) {
        StringBuffer sql = new StringBuffer();
        sql.append("select u.*, a.id as account_id, a.account_status as account_status, a.balance_amount as balance_amount ")
                .append("from user u ")
                .append("left join account a on a.user_id = u.id ")
                .append("where u.active = 1 ");
        fillWhere(queryUserDTO, sql);
        sql.append(" order by u.id desc ");
        Map<String, Object> map = buildParams(queryUserDTO);
        List<QueryUser> userList = userRepository.findByCondition(sql.toString(), queryUserDTO.getStartIndex(), queryUserDTO.getPageSize(), map, QueryUser.class);
        return userConverter.toQueryDTOs(userList);
    }

    @Override
    public UserDTO findById(Long userId) {
        User user = userRepository.getById(userId);
        return userConverter.toDTO(user);
    }
}
