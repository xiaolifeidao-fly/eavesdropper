package com.kakrolot.service.user.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.user.api.dto.QueryUserDTO;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.service.user.dao.po.QueryUser;
import com.kakrolot.service.user.dao.po.User;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserConverter extends CommonConvert<UserDTO, User> {

    public List<QueryUserDTO> toQueryDTOs(List<QueryUser> userList) {
        if (userList == null) {
            return Collections.emptyList();
        }
        return userList.stream().map(queryUser -> toQueryDTO(queryUser)).collect(Collectors.toList());
    }

    public QueryUserDTO toQueryDTO(QueryUser queryUser) {
        QueryUserDTO queryUserDTO = new QueryUserDTO();
        BeanUtils.copyProperties(queryUser, queryUserDTO);
        return queryUserDTO;
    }
}
