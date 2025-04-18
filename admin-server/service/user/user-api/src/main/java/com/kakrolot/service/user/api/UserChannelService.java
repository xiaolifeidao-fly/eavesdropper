package com.kakrolot.service.user.api;

import com.kakrolot.service.user.api.dto.ChannelDTO;
import com.kakrolot.service.user.api.dto.ChannelDetailDTO;

import java.util.List;

public interface UserChannelService {

    List<ChannelDTO> getAll();

    List<ChannelDetailDTO> getChannelDetailList();

    void saveChannelDetail(ChannelDetailDTO channelDetailDTO);

    void updateChannelDetail(ChannelDetailDTO channelDetailDTO);

}
