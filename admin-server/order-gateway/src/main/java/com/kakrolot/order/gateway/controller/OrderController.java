package com.kakrolot.order.gateway.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.kakrolot.business.service.ext.ExtPlugin;
import com.kakrolot.business.service.order.OrderQueue;
import com.kakrolot.business.service.order.OrderService;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.business.service.response.Response;
import com.kakrolot.business.service.user.UserTenantService;
import com.kakrolot.common.utils.AmountUtils;
import com.kakrolot.order.gateway.model.OrderRefundResponseModel;
import com.kakrolot.order.gateway.model.OrderRequestModel;
import com.kakrolot.order.gateway.model.OrderResponseModel;
import com.kakrolot.order.gateway.model.WebResponse;
import com.kakrolot.service.order.api.OrderRecordService;
import com.kakrolot.service.order.api.RefundOrderService;
import com.kakrolot.service.order.api.dto.*;
import com.kakrolot.service.shop.api.ShopCategoryService;
import com.kakrolot.service.shop.api.ShopExtParamService;
import com.kakrolot.service.shop.api.TenantShopCategoryService;
import com.kakrolot.service.shop.api.TenantShopService;
import com.kakrolot.service.shop.api.dto.*;
import com.kakrolot.service.user.api.UserService;
import com.kakrolot.service.user.api.dto.UserDTO;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/orders")
@Slf4j
public class OrderController extends BaseController {

    @Autowired
    private ShopCategoryService shopCategoryService;

    @Autowired
    private OrderRecordService orderRecordService;

    @Autowired
    private RefundOrderService refundOrderService;

    @Autowired
    private OrderQueue orderQueue;

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
    private ExtPlugin extPlugin;

//    @Autowired
//    private RedisQueueSubmit redisQueueSubmit;

    @RequestMapping(value = "/submit", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse<Object> save(@RequestBody OrderRequestModel orderRequestModel) {
        log.info("request submit orderRequestModel {}", orderRequestModel);
        if (StringUtils.isBlank(orderRequestModel.getBusinessKey())) {
            log.warn("submit bad param:{}", orderRequestModel);
            return WebResponse.error("参数不合规");
        }
        UserDTO userDTO = userService.findByUsername(orderRequestModel.getUserName());
        if (userDTO == null) {
            log.warn("submit not found user :{}", orderRequestModel);
            return WebResponse.error("用户姓名不存在");
        }
        if (!StringUtils.equals(userDTO.getSecretKey(), orderRequestModel.getEncryptionKey())) {
            log.warn("submit bad secret :{}", orderRequestModel);
            return WebResponse.error("用户秘钥无效");
        }
        ShopCategoryDTO shopCategoryDTO = getShopCategoryDTO(orderRequestModel);
        if (shopCategoryDTO == null || !StringUtils.equals(shopCategoryDTO.getStatus(), TenantShopStatus.ACTIVE.name())) {
            log.warn("submit bad secret or shop is expire :{}", orderRequestModel);
            return WebResponse.error("用户秘钥无效");
        }
        if (!TenantShopStatus.ACTIVE.name().equals(shopCategoryDTO.getStatus())) {
            log.warn("submit secret not active :{}", orderRequestModel);
            return WebResponse.error("用户秘钥无效");
        }
        List<Long> tenantIds = userTenantService.getTenantIdsByUserId(userDTO.getId());
        if (tenantIds.size() == 0) {
            log.warn("submit error and tenant is null:{}", orderRequestModel);
            return WebResponse.error("用户环境有问题,请联系管理员");
        }
        if (!checkTenantAndShop(tenantIds, shopCategoryDTO)) {
            log.warn("submit error and tenant auth is error :{}", orderRequestModel);
            return WebResponse.error("用户不能下单该商品");
        }
        OrderEntity orderEntity = getOrderEntity(orderRequestModel, userDTO, tenantIds.get(0), shopCategoryDTO);
        String userName = userDTO.getUsername();
        orderEntity.setUserName(userName);
        orderEntity.setUserId(userDTO.getId());
        Response response = orderService.submit(orderEntity, userDTO.getId(), shopCategoryDTO);
        return WebResponse.response(response);
    }

    private boolean checkTenantAndShop(List<Long> tenantIds, ShopCategoryDTO shopCategoryDTO) {
        List<TenantShopCategoryDTO> tenantShopCategoryDTOs = tenantShopCategoryService.findByTenantIdsAndShopCategoryId(tenantIds, shopCategoryDTO.getId());
        if (tenantShopCategoryDTOs == null || tenantShopCategoryDTOs.size() == 0) {
            return false;
        }
        return true;
    }

    /**
     * TODO 退单接口 文档
     * @param orderRequestModel
     * @return
     */
    @RequestMapping(value = "/refund", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse<Object> refundByOrderId(@RequestBody OrderRequestModel orderRequestModel) {
        log.info("request refund orderRequestModel {}", orderRequestModel);
        String orderNo = orderRequestModel.getOrderNo();
        UserDTO userDTO = userService.findByUsername(orderRequestModel.getUserName());
        if (userDTO == null) {
            log.warn("refundByOrderId {} not found user :{}", orderNo, orderRequestModel);
            return WebResponse.error("用户姓名不存在");
        }
        if (!StringUtils.equals(userDTO.getSecretKey(), orderRequestModel.getEncryptionKey())) {
            log.warn("refundByOrderId {} secret not active :{}", orderNo, orderRequestModel);
            return WebResponse.error("用户秘钥无效");
        }
        Long orderId = Long.valueOf(orderNo);
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderId);
        if (orderRecordDTO == null) {
            log.warn("refundByOrderId {} secret not active :{}", orderId, orderRequestModel);
            return WebResponse.error("订单不存在");
        }
        if (!(orderRecordDTO.getUserId().equals(userDTO.getId()))) {
            log.warn("refundByOrderId {} not auth:{}", orderId, orderRequestModel);
            return WebResponse.error("订单权限不足");
        }
        String orderStatus = orderRecordDTO.getOrderStatus();
       /* if (orderPlugin.contain(orderRecordDTO.getShopCategoryId())) {
            if (OrderStatus.PENDING.name().equals(orderStatus)) {
                return WebResponse.error("订单不允许退单");
            }
            if (OrderStatus.INIT.name().equals(orderStatus)) {
                OrderRefundRecordDTO orderRefundRecordDTO = refundOrderService.save(buildRefundOrderDTO(orderId, orderRecordDTO.getTenantId(), orderRecordDTO.getShopCategoryId()));
                Long refundOrderId = orderRefundRecordDTO.getId();
                refundOrderService.updateStatusById(OrderStatus.REFUND_HANDING.name(), refundOrderId);
                OrderEntity orderEntity = getOrderEntity(orderRequestModel, refundOrderId, orderRecordDTO, OrderStatus.REFUND_HANDING.name());
                orderEntity.setOrderNum(orderRecordDTO.getOrderNum());
                orderEntity.setPrice(orderRecordDTO.getPrice());
                orderQueue.submit(orderEntity, OrderConsumerConfig.UPDATE, orderRecordDTO.getUserId());
                return WebResponse.success("退单请求已发送");
            }
        }*/
        if (!(OrderStatus.PENDING.name().equals(orderStatus) || OrderStatus.INIT.name().equals(orderStatus))) {
            log.warn("refundByOrderId {} not allow refund :{}", orderId, orderRequestModel);
            return WebResponse.error("订单不允许退单");
        }
        Long num = refundOrderService.countByOrderId(orderId);
        if (num > 0) {
            log.warn("refundByOrderId {} had refund :{}", orderId, orderRequestModel);
            return WebResponse.error("不允许重复退单");
        }
        boolean refundResult = extPlugin.refundToBarry(orderId);
        if (!refundResult) {
            return WebResponse.error("不允许退单");
        }
        log.info("refundByOrderId {} by {} ", orderId, orderRequestModel);
        refundOrderService.save(buildRefundOrderDTO(orderId, orderRecordDTO.getTenantId(), orderRecordDTO.getShopCategoryId()));
        return WebResponse.success("退单请求已发送");
    }

    /**
     * TODO 获取订单信息接口
     */
    @RequestMapping(value = "/get", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse<OrderResponseModel> getById(@RequestBody OrderRequestModel orderRequestModel) {
        UserDTO userDTO = userService.findByUsername(orderRequestModel.getUserName());
        if (userDTO == null) {
            return WebResponse.error("用户姓名不存在");
        }
        if (!StringUtils.equals(userDTO.getSecretKey(), orderRequestModel.getEncryptionKey())) {
            return WebResponse.error("无效秘钥");
        }
        Long orderId = Long.valueOf(orderRequestModel.getOrderNo());
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderId);
        if (orderRecordDTO == null) {
            return WebResponse.error("订单不存在");
        }
        if (!userDTO.getId().equals(orderRecordDTO.getUserId())) {
            return WebResponse.error("无权限查看");
        }
        OrderResponseModel orderResponseModel = orderToResponseModel(orderRecordDTO);
        String orderStatus = orderResponseModel.getStatus();
        if (OrderStatus.REFUND.name().equals(orderStatus)) {
            OrderRefundRecordDTO orderRefundRecordDTO = refundOrderService.findByOrderId(orderId);
            orderResponseModel.setRefundAmt(orderRefundRecordDTO.getRefundAmount());
        }
        return WebResponse.success(orderResponseModel);
    }

    private ShopCategoryDTO getShopCategoryDTO(OrderRequestModel orderRequestModel) {
        String shopKey = orderRequestModel.getShopKey();
        return shopCategoryService.findBySecretKey(shopKey);
    }

    /**
     * TODO 获取待处理的订单 
     * status = INIT
     * @param orderRequestModel
     * @return
     */
    @RequestMapping(value = "/get/init", method = RequestMethod.GET)
    @ResponseBody
    public WebResponse<List<OrderResponseModel>> getInit(OrderRequestModel orderRequestModel) {
        //TODO 获取待处理的订单
        return WebResponse.success(Collections.emptyList());
    }

    /**
     * TODO 更新订单状态和数量
     */
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse<Object> update(@RequestBody OrderRequestModel orderRequestModel) {
        //TODO 参考
        // JSONObject body = new JSONObject();
        // body.put("startNum", orderRequestModel.getStartNum());
        // body.put("endNum", orderRequestModel.getEndNum());
        // body.put("orderNo", orderRequestModel.getOrderNo());
        // String status = "PENDING";
        // if (isEnd(shopDTO)) {
        //     status = "DONE";
        // }
        // body.put("status", status);
        // //kak.order.update.topic
        // redisQueueSubmit.submit(updateTopic, body);
        // return true;
        return WebResponse.success("更新订单状态和数量");
    }


    /**
     * TODO 获取订单列表接口
     */
    @RequestMapping(value = "/refunds", method = RequestMethod.GET)
    @ResponseBody
    public WebResponse<List<OrderRefundResponseModel>> orderRefundList(OrderRequestModel orderRequestModel) {
        ShopCategoryDTO shopCategoryDTO = getShopCategoryDTO(orderRequestModel);
        if (shopCategoryDTO == null) {
            return WebResponse.error("无效秘钥");
        }
        List<OrderRefundRecordDTO> orderRefundRecordDTOs = refundOrderService.findByOrderStatusAndShopCategoryId(OrderStatus.REFUND_PENDING.name(), shopCategoryDTO.getId(), orderFetchSize);
        return WebResponse.success(refundToResponseModels(orderRefundRecordDTOs));
    }

    private OrderRefundRecordDTO buildRefundOrderDTO(Long orderId, Long tenantId, Long shopCategoryId) {
        OrderRefundRecordDTO refundRecordDTO = new OrderRefundRecordDTO();
        refundRecordDTO.setOrderId(orderId);
        refundRecordDTO.setTenantId(tenantId);
        refundRecordDTO.setShopCategoryId(shopCategoryId);
        refundRecordDTO.setOrderRefundStatus(OrderStatus.REFUND_HANDING.name());
        refundRecordDTO.setRefundAmount(BigDecimal.ZERO);
        return refundRecordDTO;
    }

    private OrderEntity getOrderEntity(OrderRequestModel orderRequestModel, UserDTO userDTO, Long tenantId, ShopCategoryDTO shopCategoryDTO) {
        OrderEntity orderEntity = new OrderEntity();
        orderEntity.setIp(getRemoteIp());
        orderEntity.setOrderNum(orderRequestModel.getTotalNum());
        orderEntity.setOperator(userDTO.getUsername());
        orderEntity.setUserName(userDTO.getUsername());
        orderEntity.setBusinessId(orderRequestModel.getBusinessKey());
        orderEntity.setUserId(userDTO.getId());
        orderEntity.setTenantId(tenantId);
        JSONObject webParams = orderRequestModel.getParams();
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


    private List<OrderRefundResponseModel> refundToResponseModels(List<OrderRefundRecordDTO> refundRecordDTOs) {
        if (refundRecordDTOs == null) {
            return Collections.emptyList();
        }
        return refundRecordDTOs.stream().map(this::refundToResponseModel).collect(Collectors.toList());
    }

    private List<OrderResponseModel> orderToResponse(List<GatewayOrderRecordDTO> gatewayOrderRecordDTOs) {
        if (gatewayOrderRecordDTOs == null) {
            return Collections.emptyList();
        }
        return gatewayOrderRecordDTOs.stream().map(this::orderToResponseModel).collect(Collectors.toList());
    }


    private OrderResponseModel orderToResponseModel(GatewayOrderRecordDTO gatewayOrderRecordDTO) {
        OrderResponseModel orderResponseModel = new OrderResponseModel();
        BeanUtils.copyProperties(gatewayOrderRecordDTO, orderResponseModel);
        orderResponseModel.setOrderAmt(gatewayOrderRecordDTO.getOrderAmount());
        orderResponseModel.setOrderNo(gatewayOrderRecordDTO.getId().toString());
        return orderResponseModel;
    }

    private OrderResponseModel orderToResponseModel(OrderRecordDTO orderRecordDTO) {
        OrderResponseModel orderResponseModel = new OrderResponseModel();
        BeanUtils.copyProperties(orderRecordDTO, orderResponseModel);
        orderResponseModel.setStartNum(orderRecordDTO.getInitNum());
        orderResponseModel.setBusinessKey(orderRecordDTO.getBusinessId());
        orderResponseModel.setTotalNum(orderRecordDTO.getOrderNum());
        orderResponseModel.setStatus(orderRecordDTO.getOrderStatus());
        orderResponseModel.setStatusDesc(OrderStatus.valueOf(orderRecordDTO.getOrderStatus()).getDesc());
        orderResponseModel.setOrderAmt(orderRecordDTO.getOrderAmount());
        orderResponseModel.setOrderNo(orderRecordDTO.getId().toString());
        return orderResponseModel;
    }

    private OrderRefundResponseModel refundToResponseModel(OrderRefundRecordDTO orderRefundRecordDTO) {
        OrderRefundResponseModel orderResponseModel = new OrderRefundResponseModel();
        BeanUtils.copyProperties(orderRefundRecordDTO, orderResponseModel);
        orderResponseModel.setRefundAmt(orderRefundRecordDTO.getRefundAmount());
        orderResponseModel.setOrderNo(orderRefundRecordDTO.getOrderId().toString());
        orderResponseModel.setOrderRefundNo(orderRefundRecordDTO.getId().toString());
        return orderResponseModel;
    }

}
