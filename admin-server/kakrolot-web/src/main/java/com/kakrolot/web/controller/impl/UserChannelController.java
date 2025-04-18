package com.kakrolot.web.controller.impl;

import com.kakrolot.service.user.api.UserChannelService;
import com.kakrolot.service.user.api.dto.ChannelDetailDTO;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.userChannel.ChannelDetailWebConverter;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.userChannel.ChannelDetailModel;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/channelDetail")
@Slf4j
public class UserChannelController extends BaseController {

    @Autowired
    private UserChannelService userChannelService;

    @Autowired
    private ChannelDetailWebConverter channelDetailWebConverter;

    //渠道详情列表
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    @ResponseBody
    public WebResponse<List<ChannelDetailModel>> list() {
        List<ChannelDetailDTO> channelDetailList = userChannelService.getChannelDetailList();
        List<ChannelDetailModel> channelDetailModels = channelDetailWebConverter.toModels(channelDetailList);
        return WebResponse.success(channelDetailModels);
    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "添加渠道", httpMethod = "POST")
    public WebResponse<String> save(@RequestBody ChannelDetailModel channelDetailModel) {
        ChannelDetailDTO channelDetailDTO = channelDetailWebConverter.toDTO(channelDetailModel);
        userChannelService.saveChannelDetail(channelDetailDTO);
        return WebResponse.success("添加成功");
    }

    @RequestMapping(value = "/update", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "更新渠道", httpMethod = "POST")
    public WebResponse<String> update(@RequestBody ChannelDetailModel channelDetailModel) {
        ChannelDetailDTO channelDetailDTO = channelDetailWebConverter.toDTO(channelDetailModel);
        userChannelService.updateChannelDetail(channelDetailDTO);
        return WebResponse.success("更新成功");
    }

}
