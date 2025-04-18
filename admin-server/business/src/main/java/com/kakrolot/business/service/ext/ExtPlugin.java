package com.kakrolot.business.service.ext;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.shop.api.ShopCategoryService;
import com.kakrolot.service.shop.api.ShopService;
import com.kakrolot.service.shop.api.dto.ShopCategoryDTO;
import com.kakrolot.service.shop.api.dto.ShopDTO;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ExtPlugin {

    @Value("${barry.inlet.key:d2f323f32dsk3jv3oeu22f4g333}")
    private String inletKey;

    @Value("${barry.inlet.url:}")
    private String barryUrl;

    @Autowired
    private ShopCategoryService shopCategoryService;

    @Autowired
    private ShopService shopService;

    /**
     * @param orderRecordDTO
     * @return
     */
    public boolean inletToBarry(OrderRecordDTO orderRecordDTO) {
        JSONObject header = buildHeader(inletKey);
        Response response = null;
        try {
            JSONObject params = new JSONObject();
            buildParams(orderRecordDTO, params);
            String contentType = "application/json; charset=utf-8";
            String url = barryUrl + "/shops/inlet";
            response = OkHttpUtils.doPost(url, params, contentType, header);
            JSONObject result = JSONObject.parseObject(response.body().string());
            log.info("inletToBarry error by {} and result is {}", params, result);
            return true;
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }

    private void buildParams(OrderRecordDTO orderRecordDTO, JSONObject params) {
        ShopCategoryDTO shopCategoryDTO = shopCategoryService.findById(orderRecordDTO.getShopCategoryId());
        ShopDTO shopDTO = shopService.findById(shopCategoryDTO.getShopId());
        params.put("oriShopId", orderRecordDTO.getId());
        params.put("totalNum", orderRecordDTO.getOrderNum());
        params.put("businessKey", orderRecordDTO.getBusinessId());
        params.put("shopCategoryCode", shopCategoryDTO.getBarryShopCategoryCode());
        params.put("shopTypeCode", shopDTO.getShopTypeCode());
    }

    private JSONObject buildHeader(String inletKey) {
        JSONObject header = new JSONObject();
        header.put("secret", inletKey);
        return header;
    }

    public boolean refundToBarry(Long orderId) {
        JSONObject header = buildHeader(inletKey);
        Response response = null;
        try {
            String contentType = "application/json; charset=utf-8";
            String url = barryUrl + "/shops/" + orderId + "/refund";
            JSONObject body = new JSONObject();
            response = OkHttpUtils.doPost(url, body, contentType, header);
            JSONObject result = JSONObject.parseObject(response.body().string());
            String code = result.getString("code");
            log.info("refundToBarry by {} and result is {}", orderId, result);
            if (StringUtils.equals(code, "0")) {
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }
}
