package com.kakrolot.web.convert.userChannel;

import com.kakrolot.service.user.api.dto.ChannelDetailDTO;
import com.kakrolot.service.user.api.dto.ChannelDetailType;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.userChannel.ChannelDetailModel;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ChannelDetailWebConverter extends WebConvert<ChannelDetailDTO, ChannelDetailModel> {

    @Override
    public List<ChannelDetailModel> toModels(List<ChannelDetailDTO> dtoList) {
        if (dtoList == null) {
            return Collections.emptyList();
        }
        return dtoList.stream().map(this::toModel).collect(Collectors.toList());
    }

    @Override
    public ChannelDetailModel toModel(ChannelDetailDTO channelDetailDTO) {
        ChannelDetailModel channelDetailModel = new ChannelDetailModel();
        BeanUtils.copyProperties(channelDetailDTO,channelDetailModel);
        channelDetailModel.setTypeDesc(ChannelDetailType.valueOf(channelDetailDTO.getType()).getDesc());
        return channelDetailModel;
    }
}
