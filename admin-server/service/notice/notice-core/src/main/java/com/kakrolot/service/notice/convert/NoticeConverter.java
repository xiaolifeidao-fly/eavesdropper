package com.kakrolot.service.notice.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.notice.api.dto.NoticeDTO;
import com.kakrolot.service.notice.dao.po.Notice;
import org.springframework.stereotype.Component;

@Component
public class NoticeConverter extends CommonConvert<NoticeDTO, Notice> {

}
