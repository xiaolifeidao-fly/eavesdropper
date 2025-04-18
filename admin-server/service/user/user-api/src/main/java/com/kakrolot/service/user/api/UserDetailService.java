package com.kakrolot.service.user.api;

import com.kakrolot.service.user.api.dto.UserDetailDTO;

public interface UserDetailService {

    UserDetailDTO findByUserName(String username);

    void saveUserDetail(UserDetailDTO userDetailDTO);

    void updateUserDetail(UserDetailDTO userDetailDTO);

}
