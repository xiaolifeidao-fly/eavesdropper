package com.kakrolot.web.controller.impl;

import com.kakrolot.service.notice.api.NoticeService;
import com.kakrolot.service.notice.api.dto.NoticeDTO;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.notice.NoticeWebConvert;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.notice.NoticeModel;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notice")
@Slf4j
public class NoticeController extends BaseController {

    @Autowired
    private NoticeService noticeService;

    @Autowired
    private NoticeWebConvert noticeWebConvert;

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "通告列表", httpMethod = "GET")
    public WebResponse<List<NoticeModel>> mangerList() {
        List<NoticeDTO> allActive = noticeService.findAllActive();
        return WebResponse.success(noticeWebConvert.toNoticeModels(allActive));
    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "新增通告", httpMethod = "POST")
    public WebResponse<Long> save(@RequestBody NoticeModel noticeModel) {
        NoticeDTO noticeDTO = noticeWebConvert.toNoticeDTO(noticeModel);
        noticeDTO.setId(null);
        Long saveId = noticeService.save(noticeDTO);
        return WebResponse.success(saveId);
    }

    @RequestMapping(value = "/update", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "更新通告", httpMethod = "POST")
    public WebResponse<Long> update(@RequestBody NoticeModel noticeModel) {
        NoticeDTO noticeDTO = noticeWebConvert.toNoticeDTO(noticeModel);
        Long saveId = noticeService.save(noticeDTO);
        return WebResponse.success(saveId);
    }

    @RequestMapping(value = "/{id}/delete", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse<Long> delete(@PathVariable(name = "id") Long noticeId) {
        NoticeDTO noticeDTO = noticeService.findById(noticeId);
        noticeDTO.setActive(false);
        Long saveId = noticeService.save(noticeDTO);
        return WebResponse.success(saveId);
    }

}
