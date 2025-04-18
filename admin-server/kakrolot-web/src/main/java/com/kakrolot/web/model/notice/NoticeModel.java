package com.kakrolot.web.model.notice;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class NoticeModel extends BaseDTO {

    private String title;

    //缩略展示
    private String contentSlug;

    private String content;

}
