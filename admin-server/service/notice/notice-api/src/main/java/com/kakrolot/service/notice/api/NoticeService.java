package com.kakrolot.service.notice.api;


import com.kakrolot.service.notice.api.dto.NoticeDTO;

import java.util.List;

public interface NoticeService {

    Long save(NoticeDTO noticeDTO);

    List<NoticeDTO> findAllActive();

    NoticeDTO findById(Long id);

}
