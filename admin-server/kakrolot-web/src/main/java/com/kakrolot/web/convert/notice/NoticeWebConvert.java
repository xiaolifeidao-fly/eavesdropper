package com.kakrolot.web.convert.notice;

import com.kakrolot.service.notice.api.dto.NoticeDTO;
import com.kakrolot.service.shop.api.dto.ShopDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.notice.NoticeModel;
import com.kakrolot.web.model.shop.ShopModel;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class NoticeWebConvert extends WebConvert<ShopDTO, ShopModel> {

    public List<NoticeModel> toNoticeModels(List<NoticeDTO> noticeDTOList) {
        if (noticeDTOList == null) {
            return Collections.emptyList();
        }
        return noticeDTOList.stream().map(noticeDTO -> {
            NoticeModel noticeModel = new NoticeModel();
            BeanUtils.copyProperties(noticeDTO, noticeModel);
            String contentSlug = noticeDTO.getContent();
            if (StringUtils.isNotBlank(contentSlug) && contentSlug.length() >= 15) {
                contentSlug = contentSlug.substring(0, 15) + "......";
            }
            noticeModel.setContentSlug(contentSlug);
            return noticeModel;
        }).collect(Collectors.toList());
    }

    public NoticeDTO toNoticeDTO(NoticeModel noticeModel) {
        NoticeDTO noticeDTO = new NoticeDTO();
        BeanUtils.copyProperties(noticeModel,noticeDTO);
        return noticeDTO;
    }


}
