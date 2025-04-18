package com.kakrolot.service.notice.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.notice.dao.po.Notice;

import java.util.List;

public interface NoticeRepository extends CommonRepository<Notice, Long> {

    Notice getById(Long id);

    List<Notice> findAllByActive(Boolean active);

}
