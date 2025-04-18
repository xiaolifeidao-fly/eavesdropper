package com.kakrolot.service.notice;

import com.kakrolot.common.utils.Constant;
import com.kakrolot.service.notice.api.NoticeService;
import com.kakrolot.service.notice.api.dto.NoticeDTO;
import com.kakrolot.service.notice.convert.NoticeConverter;
import com.kakrolot.service.notice.dao.po.Notice;
import com.kakrolot.service.notice.dao.repository.NoticeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class NoticeServiceImpl implements NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private NoticeConverter noticeConverter;


    @Override
    public Long save(NoticeDTO noticeDTO) {
        Notice save = noticeRepository.save(noticeConverter.toPo(noticeDTO));
        return save.getId();
    }

    @Override
    public List<NoticeDTO> findAllActive() {
        List<Notice> noticeList = noticeRepository.findAllByActive(Constant.ACTIVE);
        return noticeConverter.toDTOs(noticeList);
    }

    @Override
    public NoticeDTO findById(Long id) {
        Notice notice = noticeRepository.findById(id).get();
        return noticeConverter.toDTO(notice);
    }
}
