package com.kakrolot.service.user.api;

import com.kakrolot.service.user.api.dto.QueryUserDTO;
import com.kakrolot.service.user.api.dto.ResourceDTO;
import com.kakrolot.service.user.api.dto.UserDTO;

import java.util.List;

public interface UserService {

    UserDTO findByUsername(String username);

    UserDTO findByPubToken(String pubToken);

    UserDTO save(UserDTO userDTO);

    List<UserDTO> findAllUserByActive(Boolean active);

    void saveUserRole(Long userId, List<Long> roleIds);

    List<Long> findRoleIdsByUserId(Long userId);

    List<ResourceDTO> findResourceByUserId(Long id);

    Long countByCondition(QueryUserDTO toQueryUserDTO);

    List<QueryUserDTO> findByCondition(QueryUserDTO queryUserDTO);

    UserDTO findById(Long userId);
}
