package com.kakrolot.service.user;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.service.user.api.UserChannelService;
import com.kakrolot.service.user.api.dto.ChannelDTO;
import com.kakrolot.service.user.api.dto.ChannelDetailDTO;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by caoti on 2021/8/5.
 */
@Service
@Slf4j
public class UserChannelServiceImpl implements UserChannelService {

    @Value("${barry.url.inner.prefix:http://127.0.0.1:9999}")
    private String barryInnerPrefix;

    @Value("${barry.url.inner.channel.list.suffix:/channel/list}")
    private String channelListSuffix;

    @Value("${barry.url.inner.channel.detail.list.suffix:/channel/detailList}")
    private String channelDetailListSuffix;

    @Value("${barry.url.inner.channel.detail.save.list.suffix:/channel/detailList/save}")
    private String channelDetailSaveSuffix;

    @Value("${barry.url.inner.channel.detail.update.list.suffix:/channel/detailList/update}")
    private String channelDetailUpdateSuffix;

    @Override
    public List<ChannelDTO> getAll() {
        String url = barryInnerPrefix + channelListSuffix;
        Response response = null;
        List<ChannelDTO> channelList = new ArrayList<>();
        try {
            response = OkHttpUtils.doGetLongTimeout(url, new JSONObject());
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            String data = jsonObject.getString("data");
            channelList = JSONObject.parseArray(data, ChannelDTO.class);
        } catch (Exception e) {
            log.error("channelList-error,e is {}", e.toString());
        }
        return channelList;
    }

    @Override
    public List<ChannelDetailDTO> getChannelDetailList() {
        String url = barryInnerPrefix + channelDetailListSuffix;
        Response response = null;
        List<ChannelDetailDTO> channelDetailList = new ArrayList<>();
        try {
            response = OkHttpUtils.doGetLongTimeout(url, new JSONObject());
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            String data = jsonObject.getString("data");
            channelDetailList = JSONObject.parseArray(data, ChannelDetailDTO.class);
        } catch (Exception e) {
            log.error("getChannelDetailList-error,e is {}", e.toString());
        }
        return channelDetailList;
    }

    @Override
    public void saveChannelDetail(ChannelDetailDTO channelDetailDTO) {
        String url = barryInnerPrefix + channelDetailSaveSuffix;
        try {
            OkHttpUtils.doPost(url, (JSONObject) JSONObject.toJSON(channelDetailDTO), "application/json", null);
        } catch (Exception e) {
            log.error("saveChannelDetail-error,e is {}", e.toString());
        }
    }

    @Override
    public void updateChannelDetail(ChannelDetailDTO channelDetailDTO) {
        String url = barryInnerPrefix + channelDetailUpdateSuffix;
        try {
            OkHttpUtils.doPost(url, (JSONObject) JSONObject.toJSON(channelDetailDTO), "application/json", null);
        } catch (Exception e) {
            log.error("updateChannelDetail-error,e is {}", e.toString());
        }
    }
}
