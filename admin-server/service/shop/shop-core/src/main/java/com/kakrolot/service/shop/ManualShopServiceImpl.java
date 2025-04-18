package com.kakrolot.service.shop;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.service.shop.api.ManualShopService;
import com.kakrolot.service.shop.api.dto.ManualShopCategoryDTO;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by caoti on 2021/7/21.
 */
@Slf4j
@Service
public class ManualShopServiceImpl implements ManualShopService {

    @Value("${barry.url.inner.prefix:http://127.0.0.1:9999}")
    private String barryInnerPrefix;

    @Value("${barry.url.inner.manual.list.suffix:/shops/shopCategories}")
    private String barryInnerManualListSuffix;

    @Value("${barry.url.inner.manual.save.suffix:/shops/shopCategory/save}")
    private String barryInnerManualSaveSuffix;

    @Value("${barry.url.inner.manual.delete.suffix:/shops/shopCategory/delete}")
    private String barryInnerManualDeleteSuffix;

    @Value("${barry.url.inner.manual.expire.suffix:/shops/shopCategory/expire}")
    private String barryInnerManualExpireSuffix;

    @Value("${barry.url.inner.manual.active.suffix:/shops/shopCategory/active}")
    private String barryInnerManualActiveSuffix;

    @Override
    public List<ManualShopCategoryDTO> findManualShopCategories() {
        String url = barryInnerPrefix + barryInnerManualListSuffix;
        Response response = null;
        List<ManualShopCategoryDTO> manualShopCategoryDTOList = new ArrayList<>();
        try {
            response = OkHttpUtils.doGetLongTimeout(url, new JSONObject());
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            String data = jsonObject.getString("data");
            manualShopCategoryDTOList = JSONObject.parseArray(data, ManualShopCategoryDTO.class);
        }catch (Exception e) {
            log.error("findManualShopCategories-error,e is {}", e.toString());
        }
        return manualShopCategoryDTOList;
    }

    @Override
    public List<Long> saveManualShopCategory(ManualShopCategoryDTO manualShopCategoryDTO) {
        String url = barryInnerPrefix + barryInnerManualSaveSuffix;
        Response response = null;
        List<Long> ids = new ArrayList<>();
        try {
            response = OkHttpUtils.doPost(url, (JSONObject) JSONObject.toJSON(manualShopCategoryDTO), "application/json", null);
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            String data = jsonObject.getString("data");
            ids = JSONObject.parseArray(data, Long.class);
        } catch (Exception e) {
            log.error("saveManualShopCategory-error,e is {}", e.toString());
        }
        return ids;
    }

    @Override
    public List<Long> deleteManualShopCategory(ManualShopCategoryDTO manualShopCategoryDTO) {
        String url = barryInnerPrefix + barryInnerManualDeleteSuffix;
        Response response = null;
        List<Long> ids = new ArrayList<>();
        try {
            response = OkHttpUtils.doPost(url, (JSONObject) JSONObject.toJSON(manualShopCategoryDTO), "application/json", null);
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            String data = jsonObject.getString("data");
            ids = JSONObject.parseArray(data, Long.class);
        } catch (Exception e) {
            log.error("deleteManualShopCategory-error,e is {}", e.toString());
        }
        return ids;
    }

    @Override
    public Long expireManualShopCategory(ManualShopCategoryDTO manualShopCategoryDTO) {
        String url = barryInnerPrefix + barryInnerManualExpireSuffix;
        Response response = null;
        Long shopCategoryId = null;
        try {
            response = OkHttpUtils.doPost(url, (JSONObject) JSONObject.toJSON(manualShopCategoryDTO), "application/json", null);
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            shopCategoryId = jsonObject.getLong("data");
        } catch (Exception e) {
            log.error("expireManualShopCategory-error,e is {}", e.toString());
        }
        return shopCategoryId;
    }

    @Override
    public Long activeManualShopCategory(ManualShopCategoryDTO manualShopCategoryDTO) {
        String url = barryInnerPrefix + barryInnerManualActiveSuffix;
        Response response = null;
        Long shopCategoryId = null;
        try {
            response = OkHttpUtils.doPost(url, (JSONObject) JSONObject.toJSON(manualShopCategoryDTO), "application/json", null);
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            shopCategoryId = jsonObject.getLong("data");
        } catch (Exception e) {
            log.error("activeManualShopCategory-error,e is {}", e.toString());
        }
        return shopCategoryId;
    }
}
