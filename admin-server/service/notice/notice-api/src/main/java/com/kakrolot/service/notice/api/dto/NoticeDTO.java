package com.kakrolot.service.notice.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class NoticeDTO extends BaseDTO {

    private String title;

    private String content;

}
