package com.kakrolot.service.user.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.user.dao.po.User;

import java.util.List;

public interface UserRepository extends CommonRepository<User, Long> {

    User findByUsername(String username);

    User findByPubToken(String pubToken);

    List<User> findAllByActive(Boolean active);

    User getById(Long userId);
}
