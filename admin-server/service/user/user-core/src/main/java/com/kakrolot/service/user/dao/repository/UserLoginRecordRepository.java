package com.kakrolot.service.user.dao.repository;

import com.kakrolot.service.user.dao.po.UserLoginRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserLoginRecordRepository extends JpaRepository<UserLoginRecord, Long> {
}
