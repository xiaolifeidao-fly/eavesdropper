package com.kakrolot.order.gateway.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.business.service.order.OrderService;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.business.service.response.Response;
import com.kakrolot.business.service.user.UserTenantService;
import com.kakrolot.common.dto.ExternalChannel;
import com.kakrolot.order.gateway.filter.RequestWrapper;
import com.kakrolot.order.gateway.model.WebResponse;
import com.kakrolot.redis.util.RedisUtil;
import com.kakrolot.service.order.api.ExternalOrderConfigService;
import com.kakrolot.service.order.api.ExternalYikeGoodsMappingService;
import com.kakrolot.service.order.api.ExternalYikeOrderRecordService;
import com.kakrolot.service.order.api.dto.*;
import com.kakrolot.service.order.api.dto.yike.ExternalYikeOrderRequestModel;
import com.kakrolot.service.order.api.dto.yike.YikeOrderDetailResponse;
import com.kakrolot.service.shop.api.ShopCategoryService;
import com.kakrolot.service.shop.api.ShopExtParamService;
import com.kakrolot.service.shop.api.TenantShopCategoryService;
import com.kakrolot.service.shop.api.dto.*;
import com.kakrolot.service.user.api.UserService;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.common.utils.SHA1Util;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/yike")
@Slf4j
public class ExternalYikeOrderController extends BaseController {

    @Autowired
    private ShopCategoryService shopCategoryService;

    @Autowired
    private UserService userService;

    @Value("${order.fetch.size:100}")
    private int orderFetchSize;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserTenantService userTenantService;

    @Autowired
    private ShopExtParamService shopExtParamService;

    @Autowired
    private TenantShopCategoryService tenantShopCategoryService;

    @Autowired
    protected RedisUtil redisService;

    @Autowired
    private ExternalYikeGoodsMappingService externalYikeGoodsMappingService;

    @Autowired
    private ExternalOrderConfigService externalOrderConfigService;

    @Autowired
    private ExternalYikeOrderRecordService externalYikeOrderRecordService;
    
    private static final String USER_TOKEN_KEY_PREFIX = "ext:user:pubtoken:";
    private static final int TOKEN_EXPIRE_DAYS = 7;

    @RequestMapping(value = "/submit", method = RequestMethod.POST, headers ={})
    @ResponseBody
    public WebResponse<Object> save(@RequestParam(name = "pub", required = false) String pubToken) {
        RequestWrapper requestWrapper = new RequestWrapper(getServletRequest());
        JSONObject jsonObject = JSONObject.parseObject(requestWrapper.getRequestBody());
        log.info("Received JSON object: {}",jsonObject );
        // 将JSON对象转换为ExternalYikeOrderRequestModel
        ExternalYikeOrderRequestModel externalYikeOrderRequestModel = jsonObject.toJavaObject(ExternalYikeOrderRequestModel.class);
        log.info("Converted to ExternalYikeOrderRequestModel: {}", externalYikeOrderRequestModel);
        
        // 检查pubToken是否为空
        if (StringUtils.isBlank(pubToken)) {
            log.warn("pubToken is not provided or is empty");
            return WebResponse.error("用户秘钥未提供");
        }
        
        // 使用新方法获取用户信息
        UserDTO userDTO = getUserByPubToken(pubToken);
        if (userDTO == null) {
            log.error("submit not found user by pubToken:{}", pubToken);
            return WebResponse.error("用户秘钥无效");
        }
        
        ShopCategoryDTO shopCategoryDTO = getShopCategoryDTO(externalYikeOrderRequestModel);
        if (shopCategoryDTO == null || !StringUtils.equals(shopCategoryDTO.getStatus(), TenantShopStatus.ACTIVE.name())) {
            log.warn("submit bad secret or shop is expire :{}", externalYikeOrderRequestModel);
            return WebResponse.error("商品秘钥无效");
        }
        List<Long> tenantIds = userTenantService.getTenantIdsByUserId(userDTO.getId());
        if (tenantIds.size() == 0) {
            log.warn("submit error and tenant is null:{}", externalYikeOrderRequestModel);
            return WebResponse.error("用户环境有问题,请联系管理员");
        }
        if (!checkTenantAndShop(tenantIds, shopCategoryDTO)) {
            log.warn("submit error and tenant auth is error :{}", externalYikeOrderRequestModel);
            return WebResponse.error("用户不能下单该商品");
        }
        //添加外部订单ID
        ExternalYikeOrderRecordDTO externalYikeOrderRecordDTOFromDB = externalYikeOrderRecordService.getByChannelAndExternalOrderId(ExternalChannel.YIKE_CHANNEL, externalYikeOrderRequestModel.getOrderSN());
        if (externalYikeOrderRecordDTOFromDB != null) {
            log.warn("external order record is exist :{}", externalYikeOrderRequestModel);
            return WebResponse.error("订单已存在,请勿重复创建");
        }
        ExternalYikeOrderRecordDTO externalYikeOrderRecordDTO = saveYikeRecord(externalYikeOrderRequestModel);

        OrderEntity orderEntity = getOrderEntity(externalYikeOrderRequestModel, userDTO, tenantIds.get(0), shopCategoryDTO);
        orderEntity.setChannel(ExternalChannel.YIKE_CHANNEL);
        orderEntity.setExternalOrderRecordId(externalYikeOrderRecordDTO.getId());
        orderEntity.setExternalOrderId(externalYikeOrderRecordDTO.getExternalOrderId());
        orderEntity.setUserName(userDTO.getUsername());
        orderEntity.setUserId(userDTO.getId());
        Response response = orderService.submit(orderEntity, userDTO.getId(), shopCategoryDTO);
        // External 通知亿刻外部系统订单状态
        notifyYikeExternalSystem(externalYikeOrderRecordDTO.getExternalOrderId());
        return WebResponse.response(response);
    }

       /**
     * 根据pubToken获取用户信息，优先从Redis获取
     * @param pubToken 用户token
     * @return 用户信息，如果未找到返回null
     */
    private UserDTO getUserByPubToken(String pubToken) {
        if (StringUtils.isBlank(pubToken)) {
            return null;
        }
        
        String redisKey = USER_TOKEN_KEY_PREFIX + pubToken;
        
        // 先从Redis中获取
        UserDTO userDTO = redisService.get(redisKey, UserDTO.class);
        if (userDTO != null) {
            return userDTO;
        }
        
        // Redis中没有，从数据库获取
        userDTO = userService.findByPubToken(pubToken);
        if (userDTO != null) {
            // 设置到Redis，7天过期
            redisService.setEx(redisKey, userDTO, TOKEN_EXPIRE_DAYS * 24 * 3600);
        } else {
            log.error("User not found by pubToken: {}", pubToken);
        }
        
        return userDTO;
    }

    private ShopCategoryDTO getShopCategoryDTO(ExternalYikeOrderRequestModel externalYikeOrderRequestModel) {
        ExternalYikeGoodsMappingDTO externalYikeGoodsMappingDTO = externalYikeGoodsMappingService.getByGoodsId(String.valueOf(externalYikeOrderRequestModel.getGoodsSN( )));
        if (externalYikeGoodsMappingDTO == null) {
            log.error("submit error and goods is not mapping :{}", externalYikeOrderRequestModel);
            return null;
        }
        return shopCategoryService.findById(externalYikeGoodsMappingDTO.getShopCategoryId());
    }

    private boolean checkTenantAndShop(List<Long> tenantIds, ShopCategoryDTO shopCategoryDTO) {
        List<TenantShopCategoryDTO> tenantShopCategoryDTOs = tenantShopCategoryService.findByTenantIdsAndShopCategoryId(tenantIds, shopCategoryDTO.getId());
        if (tenantShopCategoryDTOs == null || tenantShopCategoryDTOs.size() == 0) {
            return false;
        }
        return true;
    }

    private OrderEntity getOrderEntity(ExternalYikeOrderRequestModel externalYikeOrderRequestModel, UserDTO userDTO, Long tenantId, ShopCategoryDTO shopCategoryDTO) {
        OrderEntity orderEntity = new OrderEntity();
        orderEntity.setIp(getRemoteIp());
        orderEntity.setOrderNum(Long.valueOf(externalYikeOrderRequestModel.getNumber()));
        orderEntity.setOperator(userDTO.getUsername());
        orderEntity.setUserName(userDTO.getUsername());
        setBusinessIdAndAmountFromOrderDetail(ExternalChannel.YIKE_CHANNEL, externalYikeOrderRequestModel.getOrderSN(),orderEntity);
        orderEntity.setUserId(userDTO.getId());
        orderEntity.setTenantId(tenantId);
        // JSONObject webParams = externalYikeOrderRequestModel.getParams();
        JSONObject webParams = new JSONObject();
        if (webParams != null && !webParams.isEmpty()) {
            List<ShopExtParamDTO> shopExtParamDTOs = shopExtParamService.findByShopId(shopCategoryDTO.getShopId());
            if (shopExtParamDTOs != null && shopExtParamDTOs.size() > 0) {
                OrderRecordExtParamDTO orderRecordExtParamDTO = new OrderRecordExtParamDTO();
                JSONArray innerParams = new JSONArray();
                JSONObject params = new JSONObject();
                for (ShopExtParamDTO shopExtParamDTO : shopExtParamDTOs) {
                    Long shopExtParamId = shopExtParamDTO.getId();
                    String code = shopExtParamDTO.getCode();
                    String value = webParams.getString(code);
                    JSONObject innerItem = new JSONObject();
                    innerItem.put("shopExtParamId", shopExtParamId);
                    innerItem.put("value", value);
                    innerParams.add(innerItem);
                    params.put(shopExtParamDTO.getCode(), value);
                }
                orderRecordExtParamDTO.setInnerParams(innerParams.toJSONString());
                orderRecordExtParamDTO.setParams(params.toJSONString());
                orderEntity.setOrderRecordExtParamDTO(orderRecordExtParamDTO);
            }
        } else {
            orderEntity.setOrderRecordExtParamDTO(null);
        }
        return orderEntity;
    }

    private ExternalYikeOrderRecordDTO saveYikeRecord(ExternalYikeOrderRequestModel externalYikeOrderRequestModel) {
        ExternalYikeOrderRecordDTO externalYikeOrderRecordDTO = new ExternalYikeOrderRecordDTO();
        externalYikeOrderRecordDTO.setChannel(ExternalChannel.YIKE_CHANNEL);
        externalYikeOrderRecordDTO.setExternalOrderId(externalYikeOrderRequestModel.getOrderSN());
        externalYikeOrderRecordDTO.setGoodsId(String.valueOf(externalYikeOrderRequestModel.getGoodsSN()));
        externalYikeOrderRecordDTO.setGoodsName(externalYikeOrderRequestModel.getGoodsName());
        externalYikeOrderRecordDTO.setNumber(Long.valueOf(externalYikeOrderRequestModel.getNumber()));
        externalYikeOrderRecordDTO.setUnitPrice(externalYikeOrderRequestModel.getUnitPrice());
        return externalYikeOrderRecordService.save(externalYikeOrderRecordDTO);
    }

    private void setBusinessIdAndAmountFromOrderDetail(String channel, String orderSN, OrderEntity orderEntity) {
        ExternalOrderConfigDTO externalOrderConfigDTO = externalOrderConfigService.getByChannel(channel);
        if (externalOrderConfigDTO == null) {
            log.error("External order config not found for channel: {}", channel);
            return;
        }
        
        String requestURI = externalOrderConfigDTO.getOrderDetailUrl() + orderSN;
        String url = externalOrderConfigDTO.getPrefixUrl() + requestURI;
        String appId = externalOrderConfigDTO.getAppId();
        String appSecret = externalOrderConfigDTO.getAppSecret();
        String appTimestamp = String.valueOf(System.currentTimeMillis() / 1000);
        
        // 使用SHA1Util生成AppToken
        String appToken = SHA1Util.generateAppToken(appId, appSecret, requestURI, appTimestamp);
        
        try {
            // 构建请求头
            JSONObject headers = new JSONObject();
            headers.put("Appid", appId);
            headers.put("Apptoken", appToken);
            headers.put("AppTimestamp", appTimestamp);
            
            // 发送GET请求
            okhttp3.Response response = OkHttpUtils.doGet(url, headers);
            if (!response.isSuccessful()) {
                log.error("Failed to get order detail, url: {}, response code: {}", url, response.code());
                return;
            }
            
            // 解析响应
            String responseBody = response.body().string();
            YikeOrderDetailResponse detailResponse = JSONObject.parseObject(responseBody, YikeOrderDetailResponse.class);
            
            if (detailResponse == null || detailResponse.getCode() != 100 || detailResponse.getResult() == null) {
                log.error("Invalid response for order detail, url: {}, response: {}", url, responseBody);
                return;
            }

            // 解析params参数获取businessId
            JSONArray paramsArray = JSONArray.parseArray(detailResponse.getResult().getParams());
            String businessId = null;
            if (paramsArray != null && !paramsArray.isEmpty()) {
                JSONObject firstParam = paramsArray.getJSONObject(0);
                businessId = firstParam.getString("value");
            }
            orderEntity.setBusinessId(businessId);
            orderEntity.setExternalOrderPrice(detailResponse.getResult().getPrice());
            orderEntity.setExternalOrderAmount(detailResponse.getResult().getAmount());
        } catch (Exception e) {
            log.error("Error getting order detail, url: " + url, e);
            return;
        }
    }

    /**
     * 通知亿刻外部系统订单状态
     * -1:待付款,1:已付款,2:处理中,3:异常,4.已完成,5:退单中,6:已退单,7:已退款,8:待处理
     */
    private void notifyYikeExternalSystem(String externalOrderId) {
        ExternalOrderConfigDTO configDTO = externalOrderConfigService.getByChannel(ExternalChannel.YIKE_CHANNEL);
        if (configDTO == null) {
            log.error("External order config not found for channel: {}", ExternalChannel.YIKE_CHANNEL);
            return;
        }
        
        String requestURI = configDTO.getStatusUrl();
        String url = configDTO.getPrefixUrl() + requestURI;
        String appId = configDTO.getAppId();
        String appSecret = configDTO.getAppSecret();
        String appTimestamp = String.valueOf(System.currentTimeMillis() / 1000);
        
        // 使用SHA1Util生成AppToken
        String appToken = SHA1Util.generateAppToken(appId, appSecret, requestURI, appTimestamp);
        
        try {
            // 构建请求头
            JSONObject headers = new JSONObject();
            headers.put("Appid", appId);
            headers.put("Apptoken", appToken);
            headers.put("AppTimestamp", appTimestamp);
            
            // 构建请求体
            JSONObject requestBody = new JSONObject();
            requestBody.put("orderSN", externalOrderId);
            requestBody.put("state", 2); // 2表示处理中状态
            requestBody.put("remarks", "订单处理中"); // 备注信息
            
            // 发送POST请求
            okhttp3.Response response = OkHttpUtils.doPost(url, requestBody, "application/json", headers);
            if (!response.isSuccessful()) {
                log.error("Failed to notify Yike system, url: {}, response code: {}", url, response.code());
                return;
            }
            
            // 解析响应
            String responseBody = response.body().string();
            JSONObject result = JSONObject.parseObject(responseBody);
            
            if (result == null || result.getInteger("code") != 100) {
                log.error("Invalid response from Yike system, url: {}, response: {}", url, responseBody);
                return;
            }
            
            log.info("Successfully notified Yike system for order: {}", externalOrderId);
            
        } catch (Exception e) {
            log.error("Error notifying Yike system, url: " + url, e);
        }
    }
    


}
