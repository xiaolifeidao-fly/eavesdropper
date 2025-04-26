package com.kakrolot.web.controller.impl;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.business.service.ResponseUtils;
import com.kakrolot.business.service.ext.ExtPlugin;
import com.kakrolot.business.service.order.OrderConsumerConfig;
import com.kakrolot.business.service.order.OrderQueue;
import com.kakrolot.business.service.order.OrderService;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.business.service.response.Response;
import com.kakrolot.business.service.user.UserAccountService;
import com.kakrolot.business.service.user.UserTenantService;
import com.kakrolot.lock.KakrolotLock;
import com.kakrolot.service.account.api.AccountService;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.account.api.dto.AccountLockKey;
import com.kakrolot.service.account.api.dto.AmountType;
import com.kakrolot.service.dashboard.api.DashboardService;
import com.kakrolot.service.dashboard.api.dto.OrderSummaryDTO;
import com.kakrolot.service.dashboard.api.dto.QueryOrderSummaryDTO;
import com.kakrolot.service.order.api.OrderAmountDetailService;
import com.kakrolot.service.order.api.OrderBkRecordService;
import com.kakrolot.service.order.api.OrderRecordService;
import com.kakrolot.service.order.api.OrderTokenDetailService;
import com.kakrolot.service.order.api.RefundOrderService;
import com.kakrolot.service.order.api.dto.*;
import com.kakrolot.service.shop.api.*;
import com.kakrolot.service.shop.api.dto.*;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.web.auth.annotations.Auth;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.order.OrderAmountDetailWebConvert;
import com.kakrolot.web.convert.order.OrderTokenWebConvert;
import com.kakrolot.web.convert.order.OrderWebConvert;
import com.kakrolot.web.model.PageModel;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.order.*;
import com.kakrolot.web.util.XhsQueryUtils;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.text.ParseException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/orders")
@Slf4j
public class OrderController extends BaseController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private RefundOrderService refundOrderService;

    @Autowired
    private OrderRecordService orderRecordService;

    @Autowired
    private OrderWebConvert orderWebConvert;

    @Autowired
    private OrderTokenWebConvert orderTokenWebConvert;

    @Autowired
    private OrderAmountDetailService orderAmountDetailService;

    @Autowired
    private OrderAmountDetailWebConvert orderAmountDetailWebConvert;

    @Autowired
    private AccountService accountService;

    @Autowired
    private KakrolotLock kakrolotLock;

    @Autowired
    private OrderQueue orderQueue;

    @Autowired
    private OrderBkRecordService orderBkRecordService;

    @Autowired
    private UserAccountService userAccountService;

    @Autowired
    private DashboardService dashboardService;

    @Value("${barry.query.url:}")
    private String bladeQueryUrl;

    @Autowired
    private ShopService shopService;

    @Autowired
    private ExtPlugin extPlugin;

    @Autowired
    private ShopGroupService shopGroupService;

    @Autowired
    private UserTenantService userTenantService;

    @Autowired
    private TenantShopService tenantShopService;

    @Autowired
    private ShopExtParamService shopExtParamService;

    @Autowired
    private XhsQueryUtils xhsQueryUtils;

    @Autowired
    private TenantShopCategoryService tenantShopCategoryService;

    @Autowired
    private ShopCategoryService shopCategoryService;

    @Autowired
    private OrderTokenDetailService orderTokenDetailService;

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "下单", httpMethod = "POST")
    public WebResponse<Object> save(@RequestBody OrderRecordModel orderModel) {
        UserDTO userDTO = getCurrentUser();
        OrderRecordDTO orderRecordDTO = orderWebConvert.toDTO(orderModel);
        OrderEntity orderEntity = buildOrderEntity(orderRecordDTO, userDTO,orderModel.getOrderRecordExtParamModelList());
        String userName = userDTO.getUsername();
        orderEntity.setUserName(userName);
        orderEntity.setUserId(userDTO.getId());
        orderEntity.setIp(getRemoteIp());
        orderEntity.setOperator(getCurrentUser().getUsername());
        Response response = orderService.submit(orderEntity, userDTO.getId());
        return WebResponse.response(response);
    }

    private OrderEntity buildOrderEntity(OrderRecordDTO orderRecordDTO, UserDTO userDTO,List<OrderRecordExtParamModel> orderRecordExtParamModelList) {
        OrderEntity orderEntity = new OrderEntity();
        BeanUtils.copyProperties(orderRecordDTO, orderEntity);
        orderEntity.setIp(getRemoteIp());
        orderEntity.setOperator(userDTO.getUsername());
        if(CollectionUtils.isNotEmpty(orderRecordExtParamModelList)) {
            OrderRecordExtParamDTO orderRecordExtParamDTO = new OrderRecordExtParamDTO();
            JSONArray innerParams = new JSONArray();
            JSONObject params = new JSONObject();
            for(OrderRecordExtParamModel orderRecordExtParamModel : orderRecordExtParamModelList) {
                Long shopExtParamId = orderRecordExtParamModel.getShopExtParamId();
                String value = orderRecordExtParamModel.getValue();
                ShopExtParamDTO shopExtParamDTO = shopExtParamService.getById(shopExtParamId);
                JSONObject innerItem = new JSONObject();
                innerItem.put("shopExtParamId", shopExtParamId);
                innerItem.put("value", value);
                innerParams.add(innerItem);
                params.put(shopExtParamDTO.getCode(), value);
            }
            orderRecordExtParamDTO.setInnerParams(innerParams.toJSONString());
            orderRecordExtParamDTO.setParams(params.toJSONString());
            orderEntity.setOrderRecordExtParamDTO(orderRecordExtParamDTO);
        } else {
            orderEntity.setOrderRecordExtParamDTO(null);
        }
        return orderEntity;
    }

    @RequestMapping(value = "/{id}/real", method = RequestMethod.GET)
    @ResponseBody
    public WebResponse<OrderRecordModel> real(@PathVariable(name = "id") Long orderId) {
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderId);
        if (orderRecordDTO == null) {
            return WebResponse.error("订单不存在");
        }
        OrderRecordModel orderRecordModel = orderWebConvert.toModel(orderRecordDTO);
        fillFactNum(orderRecordModel);
        fillBusinessType(orderRecordModel, orderRecordDTO);
        return WebResponse.success(orderRecordModel);
    }

    private void fillBusinessType(OrderRecordModel orderRecordModel, OrderRecordDTO orderRecordDTO) {
        ShopDTO shopDTO = shopService.findById(orderRecordDTO.getShopId());
        Long shopGroupId = shopDTO.getShopGroupId();
        if (shopGroupId != null) {
            ShopGroupDTO shopGroupDTO = shopGroupService.findById(shopGroupId);
            orderRecordModel.setBusinessType(shopGroupDTO.getBusinessType());
        }
    }

    @RequestMapping(value = "/batchRefund", method = RequestMethod.GET)
    @Auth(isIntercept = false)
    public WebResponse<String> batchRefund() throws ParseException {
        Date date = DateUtils.parseDate("2020-06-04", "yyyy-MM-dd");
        List<OrderRecordDTO> orderRecordDTOs = orderRecordService.findByOrderStatusAndCreatedTime(OrderStatus.REFUND_PENDING.name(), date);
        for (OrderRecordDTO orderRecordDTO : orderRecordDTOs) {
            orderRecordDTO.setOrderStatus(OrderStatus.PENDING.name());
            orderRecordService.save(orderRecordDTO);
            Long num = refundOrderService.countByOrderId(orderRecordDTO.getId());
            if (num > 0) {
                continue;
            }
            refundOrderService.save(buildRefundOrderDTO(orderRecordDTO.getId(), orderRecordDTO.getTenantId(), orderRecordDTO.getShopCategoryId(), orderRecordDTO));
        }
        return WebResponse.success("success");
    }

    private void fillFactNum(OrderRecordModel orderRecordModel) {
        okhttp3.Response response = null;
        try {
            String url = bladeQueryUrl + "/userTasks/getTask?extOrderId=" + orderRecordModel.getId();
            response = OkHttpUtils.doGet(url, null);
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            Long num = jsonObject.getLong("num");
            Long rgApproveNum = jsonObject.getLong("rgApproveNum");
            Long rgUnApproveNum = jsonObject.getLong("rgUnApproveNum");
            orderRecordModel.setRgApproveNum(rgApproveNum);
            orderRecordModel.setBid(jsonObject.getString("businessId"));
            orderRecordModel.setRgUnApproveNum(rgUnApproveNum);
            orderRecordModel.setFactNum(num);
            //根据shop类型  获取小红薯的实际值
            String shopName = orderRecordModel.getShopName();
            /*if(StringUtils.isNotBlank(shopName) && shopName.contains("小红")){
                JSONObject noteDetail = xhsQueryUtils.getNoteDetailFromWebApi(orderRecordModel.getBid());
                if(shopName.contains("点赞")) {
                    orderRecordModel.setFactNum(noteDetail.getLong("likes") - orderRecordModel.getInitNum());
                }
                if(shopName.contains("收藏")) {
                    orderRecordModel.setFactNum(noteDetail.getLong("collects") - orderRecordModel.getInitNum());
                }
                if(shopName.contains("关注")) {
                    orderRecordModel.setFactNum(noteDetail.getJSONObject("user").getLong("fans") - orderRecordModel.getInitNum());
                }
            }*/
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }

    @RequestMapping(value = "/{id}/refund", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse<String> refund(@PathVariable(name = "id") Long orderId) {
        UserDTO userDTO = getCurrentUser();
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderId);
        if (orderRecordDTO == null) {
            return WebResponse.error("订单不存在");
        }
        if (!(orderRecordDTO.getUserId().equals(userDTO.getId()))) {
            return WebResponse.error("订单权限不足");
        }
        String orderStatus = orderRecordDTO.getOrderStatus();
        if (!(OrderStatus.PENDING.name().equals(orderStatus) || OrderStatus.INIT.name().equals(orderStatus))) {
            return WebResponse.error("订单不允许退单");
        }
        // extPlugin.refundToBarry(orderId);
        Long num = refundOrderService.countByOrderId(orderId);
        if (num > 0) {
            return WebResponse.error("不允许重复退单");
        }
        refundOrderService.save(buildRefundOrderDTO(orderId, orderRecordDTO.getTenantId(), orderRecordDTO.getShopCategoryId(), orderRecordDTO));
        return WebResponse.successMessage("退单请求已发送");
    }

    @RequestMapping(value = "/{id}/bk", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "订单补款", httpMethod = "POST")
    public WebResponse<Object> payAmount(@PathVariable("id") Long id, @RequestBody OrderRecordModel orderModel) {
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(id);
        if (!(StringUtils.equals(orderRecordDTO.getOrderStatus(), OrderStatus.REFUND_SUCCESS.name()) || StringUtils.equals(orderRecordDTO.getOrderStatus(), OrderStatus.DONE.name()))) {
            return WebResponse.error("此订单不允许退款");
        }
        Long bkNum = orderModel.getBkNum();
        if (bkNum > orderRecordDTO.getOrderNum()) {
            return WebResponse.error("补款数量不能大于此订单的总数量");
        }
        BigDecimal amount = orderRecordDTO.getPrice().multiply(new BigDecimal(bkNum));
        String lockType = AccountLockKey.LOCK_KEY;
        String key = lockType + "_" + orderRecordDTO.getUserId();
        try {
            boolean lockResult = kakrolotLock.lock(lockType, key);
            if (!lockResult) {
                return WebResponse.error("账户被锁定,请稍后再试");
            }
        } catch (Exception e) {
            log.error("payAmount getLock by {} error", key);
            return WebResponse.error("充值发生未知异常");
        }
        try {
            OrderBkRecordDTO orderBkRecordDTO = orderBkRecordService.findByOrderId(id);
            if (orderBkRecordDTO != null) {
                return WebResponse.error("不能重复补款");
            }
            AccountDTO accountDTO = accountService.findByUserId(orderRecordDTO.getUserId());
            String businessId = AmountType.BK.name() + "_" + orderRecordDTO.getId();
            Response response = userAccountService.handlerAmount(accountDTO, amount, getRemoteIp(), getCurrentUser().getUsername(), AmountType.BK, businessId,orderRecordDTO.getId());
            if (ResponseUtils.isSuccess(response)) {
                orderAmountDetailService.save(buildOrderAmountDetail(id, amount));
                OrderBkRecordDTO newOrderBkRecordDTO = buildOrderBkRecordDTO(orderRecordDTO, bkNum, amount);
                orderBkRecordService.save(newOrderBkRecordDTO);
            }
            return WebResponse.response(response);
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            kakrolotLock.unLock(lockType, lockType);
        }
    }


    private OrderBkRecordDTO buildOrderBkRecordDTO(OrderRecordDTO orderRecordDTO, Long bkNum, BigDecimal amount) {
        OrderBkRecordDTO orderBkRecordDTO = new OrderBkRecordDTO();
        orderBkRecordDTO.setAmount(amount);
        orderBkRecordDTO.setNum(bkNum);
        orderBkRecordDTO.setOrderId(orderRecordDTO.getId());
        orderBkRecordDTO.setShopCategoryId(orderRecordDTO.getShopCategoryId());
        orderBkRecordDTO.setShopId(orderRecordDTO.getShopId());
        orderBkRecordDTO.setTenantId(orderRecordDTO.getTenantId());
        return orderBkRecordDTO;
    }

    private OrderAmountDetailDTO buildOrderAmountDetail(Long orderId, BigDecimal amount) {
        OrderAmountDetailDTO orderAmountDetailDTO = new OrderAmountDetailDTO();
        orderAmountDetailDTO.setOrderId(orderId);
        orderAmountDetailDTO.setOrderConsumerAmount(amount);
        orderAmountDetailDTO.setDescription("补款:" + amount + "元");
        return orderAmountDetailDTO;
    }

    @RequestMapping(value = "/{id}/refund/force", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse<String> forceRefund(@PathVariable(name = "id") Long orderId) {
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderId);
        if (orderRecordDTO == null) {
            return WebResponse.error("订单不存在");
        }
        extPlugin.refundToBarry(orderId);
        OrderRefundRecordDTO refundRecordDTO = refundOrderService.findByOrderId(orderId);
        if (refundRecordDTO != null) {
            String orderStatus = orderRecordDTO.getOrderStatus();
            if (StringUtils.equals(orderStatus, OrderStatus.INIT.name())) {
                OrderEntity orderEntity = getOrderEntity(refundRecordDTO.getId(), orderRecordDTO, OrderStatus.REFUND_HANDING.name());
                orderEntity.setOrderNum(orderRecordDTO.getOrderNum());
                orderEntity.setEndNum(0L);
                orderEntity.setInitNum(0L);
                orderEntity.setPrice(orderRecordDTO.getPrice());
                orderQueue.submit(orderEntity, OrderConsumerConfig.UPDATE, orderRecordDTO.getUserId());
                return WebResponse.successMessage("退单请求已发送");
            }
            String refundStatus = refundRecordDTO.getOrderRefundStatus();
            if (StringUtils.equals(refundStatus, OrderStatus.REFUND_HANDING.name())) {
                refundOrderService.updateStatusById(OrderStatus.REFUND_PENDING.name(), refundRecordDTO.getId());
            }
            return WebResponse.error("不能重复退单");
        }
        refundOrderService.save(buildRefundOrderDTO(orderId, orderRecordDTO.getTenantId(), orderRecordDTO.getShopCategoryId(), orderRecordDTO));
        return WebResponse.successMessage("退单请求已发送");
    }

    private OrderEntity getOrderEntity(Long id, OrderRecordDTO orderRecordDTO, String orderStatus) {
        OrderEntity orderEntity = new OrderEntity();
        orderEntity.setId(id);
        orderEntity.setIp(getRemoteIp());
        orderEntity.setEndNum(orderRecordDTO.getEndNum());
        orderEntity.setInitNum(orderRecordDTO.getInitNum());
        orderEntity.setOperator(orderRecordDTO.getUserName());
        orderEntity.setOrderStatus(orderStatus);
        orderEntity.setUserName(orderRecordDTO.getUserName());
        orderEntity.setUserId(orderRecordDTO.getUserId());
        return orderEntity;
    }

    private OrderRefundRecordDTO buildRefundOrderDTO(Long orderId, Long tenantId, Long shopCategoryId, OrderRecordDTO orderRecordDTO) {
        // 获取该订单下所有token记录
        List<OrderTokenDetailDTO> tokenDetails = orderTokenDetailService.findByOrderRecordId(orderId);
        
        // 计算UNBIND和BIND_FAILED状态的token数量
        long refundableTokenCount = tokenDetails.stream()
                .filter(token -> TokenBindStatus.UNBIND.name().equals(token.getStatus()) 
                        || TokenBindStatus.BIND_FAILED.name().equals(token.getStatus()))
                .count();
        
        // 计算退款金额 = 可退款token数量 * 单价
        BigDecimal refundAmount = orderRecordDTO.getPrice().multiply(new BigDecimal(refundableTokenCount));
        
        // 创建退单记录
        OrderRefundRecordDTO refundRecordDTO = new OrderRefundRecordDTO();
        refundRecordDTO.setOrderId(orderId);
        refundRecordDTO.setTenantId(tenantId);
        refundRecordDTO.setShopCategoryId(shopCategoryId);
        refundRecordDTO.setOrderRefundStatus(OrderStatus.REFUND_PENDING.name());
        refundRecordDTO.setRefundAmount(refundAmount);
        
        // 进行退款操作
        try {
            // 获取用户账户信息
            AccountDTO accountDTO = accountService.findByUserId(orderRecordDTO.getUserId());
            if (accountDTO == null) {
                log.error("退款失败，未找到用户账户信息: userId={}", orderRecordDTO.getUserId());
                refundRecordDTO.setOrderRefundStatus(OrderStatus.REFUND_FAILED.name());
                return refundRecordDTO;
            }
            
            // 退款业务ID
            String businessId = AmountType.REFUND.name() + "_" + orderId;
            
            // 调用退款方法，注意这里是退款，所以金额是正数
            Response refundResponse = userAccountService.handlerAmount(
                accountDTO, 
                refundAmount, // 正数表示退款
                getRemoteIp(),
                getCurrentUser().getUsername(),
                AmountType.REFUND,
                businessId,orderId
            );
            
            // 根据退款结果更新退款记录状态
            if (ResponseUtils.isSuccess(refundResponse)) {
                log.info("订单{}退款成功：总token数量{}，可退款token数量{}，退款金额{}", 
                        orderId, tokenDetails.size(), refundableTokenCount, refundAmount);
                refundRecordDTO.setOrderRefundStatus(OrderStatus.REFUND_SUCCESS.name());
                
                // 更新订单状态为已退款
                orderRecordDTO.setEndNum(orderRecordDTO.getOrderNum() - refundableTokenCount);
                orderRecordDTO.setOrderStatus(OrderStatus.REFUND_SUCCESS.name());
                orderRecordService.save(orderRecordDTO);
            } else {
                log.error("订单{}退款失败：{}，总token数量{}，可退款token数量{}，退款金额{}", 
                        orderId, refundResponse.getMessage(), tokenDetails.size(), refundableTokenCount, refundAmount);
                refundRecordDTO.setOrderRefundStatus(OrderStatus.REFUND_FAILED.name());
            }
        } catch (Exception e) {
            log.error("订单{}退款异常：", orderId, e);
            refundRecordDTO.setOrderRefundStatus(OrderStatus.REFUND_FAILED.name());
        }
        
        return refundRecordDTO;
    }

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "订单列表", httpMethod = "GET")
    public WebResponse<PageModel<QueryOrderModel>> list(QueryOrderModel queryOrderModel,
                                                        @RequestParam("page") int startIndex,
                                                        @RequestParam("limit") int pageSize,
                                                        @RequestParam("sort") String sort) {
        QueryOrderDTO queryOrderDTO = orderWebConvert.toQueryDTO(queryOrderModel, startIndex, pageSize);
        queryOrderDTO.setUserId(getCurrentUser().getId());
        Long count = orderRecordService.countByCondition(queryOrderDTO);
        List<QueryOrderDTO> queryOrderDTOs = null;
        if (count > 0) {
            queryOrderDTOs = orderRecordService.findByCondition(queryOrderDTO);
        }
        return WebResponse.success(orderWebConvert.toPageModel(count, queryOrderDTOs));
    }

    @RequestMapping(value = "/manager/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "订单列表(管理员)", httpMethod = "GET")
    public WebResponse<PageModel<QueryOrderModel>> mangerList(QueryOrderModel queryOrderModel,
                                                              @RequestParam("page") int startIndex,
                                                              @RequestParam("limit") int pageSize,
                                                              @RequestParam("sort") String sort) {
        QueryOrderDTO queryOrderDTO = orderWebConvert.toQueryDTO(queryOrderModel, startIndex, pageSize);
        Long count = orderRecordService.countByManagerCondition(queryOrderDTO);
        List<QueryOrderDTO> queryOrderDTOs = null;
        if (count > 0) {
            queryOrderDTOs = orderRecordService.findByManagerCondition(queryOrderDTO);
        }
        return WebResponse.success(orderWebConvert.toPageModel(count, queryOrderDTOs));
    }

    @RequestMapping(value = "/external/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "订单列表(外部人员)", httpMethod = "GET")
    public WebResponse<PageModel<QueryOrderExternalModel>> externalList(QueryOrderModel queryOrderModel,
                                                                        @RequestParam("page") int startIndex,
                                                                        @RequestParam("limit") int pageSize,
                                                                        @RequestParam("sort") String sort) {
        QueryOrderDTO queryOrderDTO = orderWebConvert.toQueryDTO(queryOrderModel, startIndex, pageSize);
        Long count = orderRecordService.countByManagerCondition(queryOrderDTO);
        List<QueryOrderDTO> queryOrderDTOs = null;
        if (count > 0) {
            queryOrderDTOs = orderRecordService.findByManagerCondition(queryOrderDTO);
        }
        return WebResponse.success(orderWebConvert.toPageExternalModel(count, queryOrderDTOs));
    }

    @RequestMapping(value = "/summary", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "查询订单汇总", httpMethod = "GET")
    public WebResponse<List<OrderSummaryModel>> orderSummaryList(QueryOrderSummaryModel queryOrderSummaryModel) {
        UserDTO userDTO = getCurrentUser();
//        if(BusinessCode.DY.name().equals(queryOrderSummaryModel.getBusinessCode()) && !"caoti".equals(userDTO.getUsername())) {
//            return WebResponse.error("java.lang.IndexOutOfBoundsException");
//        }
        QueryOrderSummaryDTO queryOrderSummaryDTO = orderWebConvert.toQueryOrderSummaryDTO(queryOrderSummaryModel);
        OrderSummaryDTO orderSummaryDTO = dashboardService.findBySummaryCondition(queryOrderSummaryDTO, userDTO.getId());
        return WebResponse.success(orderWebConvert.toOrderSummaryModels(queryOrderSummaryModel.getBusinessType(), Arrays.asList(orderSummaryDTO)));
    }

    @RequestMapping(value = "/currentShopGroup", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "根据当前用户的租户查询对应的商品在查询对应的shopGroup", httpMethod = "GET")
    public WebResponse<List<ShopGroupModel>> currentShopGroup() {
        UserDTO userDTO = getCurrentUser();
        List<Long> tenantIdsByUserId = userTenantService.getTenantIdsByUserId(userDTO.getId());
        List<TenantShopCategoryDTO> tenantShopCategoryDTOList = tenantShopCategoryService.findByTenantIds(tenantIdsByUserId);
        List<Long> shopCategoryIds = tenantShopCategoryDTOList.stream().map(TenantShopCategoryDTO::getShopCategoryId).collect(Collectors.toList());
        List<ShopCategoryDTO> shopCategoryDTOList = shopCategoryService.findByIdsAndActive(shopCategoryIds);
        List<Long> shopIds = shopCategoryDTOList.stream().map(ShopCategoryDTO::getShopId).collect(Collectors.toList());
        List<ShopDTO> shopDTOList = shopService.findByIdsAndActive(shopIds);
        List<ShopGroupDTO> shopGroupDTOList = shopDTOList.stream().map(shopDTO ->
                shopGroupService.findById(shopDTO.getShopGroupId())).collect(Collectors.toList());
        return WebResponse.success(orderWebConvert.toShopGroupModels(shopGroupDTOList));
    }


    @RequestMapping(value = "/{orderId}/detail", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "订单明细", httpMethod = "GET")
    public WebResponse<List<OrderAmountDetailModel>> getOrderAmountDetail(@PathVariable(name = "orderId") Long orderId) {
        List<OrderAmountDetailDTO> orderAmountDetailDTOs = orderAmountDetailService.findByOrderId(orderId);
        return WebResponse.success(orderAmountDetailWebConvert.convertModels(orderAmountDetailDTOs));
    }

    @RequestMapping(value = "/{orderId}/tokens", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "订单Token详情", httpMethod = "GET")
    public WebResponse<PageModel<OrderTokenDetailModel>> getOrderTokenDetails(
            @PathVariable(name = "orderId") Long orderId,
            @RequestParam("page") int startIndex,
            @RequestParam("limit") int pageSize) {
        
        // 获取当前用户信息
        UserDTO userDTO = getCurrentUser();
        
        // 获取订单信息，验证权限
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderId);
        if (orderRecordDTO == null) {
            return WebResponse.error("订单不存在");
        }
        
        // 验证权限 - 非管理员只能查看自己的订单
        if (!(orderRecordDTO.getUserId().equals(userDTO.getId()))) {
            return WebResponse.error("订单权限不足");
        }
        
        List<OrderTokenDetailDTO> allTokenDetails = orderTokenDetailService.findByOrderRecordId(orderId);
        
        // 计算总数
        long total = allTokenDetails.size();
        
        // 手动分页
        int fromIndex = (startIndex - 1) * pageSize;
        if (fromIndex >= allTokenDetails.size()) {
            // 如果起始索引超出范围，返回空列表
            allTokenDetails = Collections.emptyList();
        } else {
            int toIndex = Math.min(fromIndex + pageSize, allTokenDetails.size());
            allTokenDetails = allTokenDetails.subList(fromIndex, toIndex);
        }
        
        // 构建分页模型
        PageModel<OrderTokenDetailModel> pageModel = new PageModel<>();
        pageModel.setTotal(total);
        pageModel.setItems(orderTokenWebConvert.toModels(allTokenDetails));
        
        return WebResponse.success(pageModel);
    }

    @RequestMapping(value = "/manager/{orderId}/tokens", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "订单Token详情(管理员)", httpMethod = "GET")
    public WebResponse<PageModel<OrderTokenDetailModel>> getOrderTokenDetailsForManager(
            @PathVariable(name = "orderId") Long orderId,
            @RequestParam("page") int startIndex,
            @RequestParam("limit") int pageSize) {
        
        // 获取订单信息
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderId);
        if (orderRecordDTO == null) {
            return WebResponse.error("订单不存在");
        }
        
        List<OrderTokenDetailDTO> allTokenDetails = orderTokenDetailService.findByOrderRecordId(orderId);
        
        // 计算总数
        long total = allTokenDetails.size();
        
        // 手动分页
        int fromIndex = (startIndex - 1) * pageSize;
        if (fromIndex >= allTokenDetails.size()) {
            // 如果起始索引超出范围，返回空列表
            allTokenDetails = Collections.emptyList();
        } else {
            int toIndex = Math.min(fromIndex + pageSize, allTokenDetails.size());
            allTokenDetails = allTokenDetails.subList(fromIndex, toIndex);
        }
        
        // 构建分页模型
        PageModel<OrderTokenDetailModel> pageModel = new PageModel<>();
        pageModel.setTotal(total);
        pageModel.setItems(orderTokenWebConvert.toModels(allTokenDetails));
        
        return WebResponse.success(pageModel);
    }

    @RequestMapping(value = "/tokens/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "激活码列表", httpMethod = "GET")
    public WebResponse<PageModel<OrderTokenDetailModel>> tokenList(QueryTokenDetailModel queryTokenDetailModel,
                                                        @RequestParam("page") int startIndex,
                                                        @RequestParam("limit") int pageSize,
                                                        @RequestParam("sort") String sort) {
        
        // 创建查询条件对象并设置当前用户ID
        QueryTokenDetailDTO queryTokenDetailDTO = orderTokenWebConvert.toQueryDTO(queryTokenDetailModel, startIndex, pageSize);
        queryTokenDetailDTO.setUserId(getCurrentUser().getId());
//        queryTokenDetailDTO.setSort(sort);
        
        // 查询总数
        Long count = orderTokenDetailService.countByCondition(queryTokenDetailDTO);
        List<OrderTokenDetailDTO> tokenDetailDTOs = null;
        if (count > 0) {
            // 查询数据
            tokenDetailDTOs = orderTokenDetailService.findByCondition(queryTokenDetailDTO);
        }
        
        // 构建返回结果
        PageModel<OrderTokenDetailModel> pageModel = new PageModel<>();
        pageModel.setTotal(count);
        pageModel.setItems(orderTokenWebConvert.toModels(tokenDetailDTOs));
        
        return WebResponse.success(pageModel);
    }

    @RequestMapping(value = "/manager/tokens/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "激活码列表(管理员)", httpMethod = "GET")
    public WebResponse<PageModel<OrderTokenDetailModel>> managerTokenList(QueryTokenDetailModel queryTokenDetailModel,
                                                              @RequestParam("page") int startIndex,
                                                              @RequestParam("limit") int pageSize,
                                                              @RequestParam("sort") String sort) {
        
        // 创建查询条件对象
        QueryTokenDetailDTO queryTokenDetailDTO = orderTokenWebConvert.toQueryDTO(queryTokenDetailModel, startIndex, pageSize);
//        queryTokenDetailDTO.setSort(sort);
        
        // 查询总数
        Long count = orderTokenDetailService.countByManagerCondition(queryTokenDetailDTO);
        List<OrderTokenDetailDTO> tokenDetailDTOs = null;
        if (count > 0) {
            // 查询数据
            tokenDetailDTOs = orderTokenDetailService.findByManagerCondition(queryTokenDetailDTO);
        }
        
        // 构建返回结果
        PageModel<OrderTokenDetailModel> pageModel = new PageModel<>();
        pageModel.setTotal(count);
        pageModel.setItems(orderTokenWebConvert.toModels(tokenDetailDTOs));
        
        return WebResponse.success(pageModel);
    }

}
