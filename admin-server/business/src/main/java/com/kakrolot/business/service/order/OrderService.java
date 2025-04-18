package com.kakrolot.business.service.order;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.business.service.BaseService;
import com.kakrolot.business.service.ResponseUtils;
import com.kakrolot.business.service.order.entity.OrderEntity;
import com.kakrolot.business.service.order.support.OrderValidate;
import com.kakrolot.business.service.response.Response;
import com.kakrolot.common.utils.AmountUtils;
import com.kakrolot.service.account.api.AccountService;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.order.api.OrderRecordExtParamService;
import com.kakrolot.service.order.api.OrderRecordService;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.order.api.dto.OrderRecordExtParamDTO;
import com.kakrolot.service.order.api.dto.OrderStatus;
import com.kakrolot.service.shop.api.ShopCategoryService;
import com.kakrolot.service.shop.api.ShopExtParamService;
import com.kakrolot.service.shop.api.ShopService;
import com.kakrolot.service.shop.api.TenantShopService;
import com.kakrolot.service.shop.api.dto.ShopCategoryDTO;
import com.kakrolot.service.shop.api.dto.ShopDTO;
import com.kakrolot.service.tenant.api.TenantService;
import com.kakrolot.service.tenant.api.dto.TenantDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class OrderService extends BaseService {

    @Autowired
    private OrderRecordService orderRecordService;

    @Autowired
    private OrderQueue orderQueue;

    @Autowired
    private ShopCategoryService shopCategoryService;

    @Autowired
    private TenantShopService tenantShopService;

    @Autowired
    private ShopService shopService;

    @Autowired
    private OrderValidate orderValidate;

    @Autowired
    private AccountService accountService;

    @Autowired
    private TenantService tenantService;

    @Autowired
    private ShopExtParamService shopExtParamService;

    @Autowired
    private OrderRecordExtParamService orderRecordExtParamService;

    public Response submit(OrderEntity orderEntity, Long userId) {
        try {
            ShopCategoryDTO shopCategoryDTO = shopCategoryService.findById(orderEntity.getShopCategoryId());
            return submit(orderEntity, userId, shopCategoryDTO);
        } catch (Exception e) {
            log.error("submit user order by {} and {} error:", userId, orderEntity, e);
            return ResponseUtils.buildError("下单发生未知异常");
        }
    }

    public Response submit(OrderEntity orderEntity, Long userId, ShopCategoryDTO shopCategoryDTO) {
        try {
            Long lowerLimit = shopCategoryDTO.getLowerLimit();
            if (lowerLimit > orderEntity.getOrderNum()) {
                return ResponseUtils.buildError("下单量不能低于:" + lowerLimit);
            }
            Long upperLimit = shopCategoryDTO.getUpperLimit();
            if (upperLimit < orderEntity.getOrderNum()) {
                return ResponseUtils.buildError("下单量不能大于:" + upperLimit);
            }
            BigDecimal price = shopCategoryDTO.getPrice();
            if (price == null || price.equals(BigDecimal.ZERO)) {
                return ResponseUtils.buildError("商品单价不能为0");
            }
            orderEntity.setPrice(price);
            ShopDTO shopDTO = shopService.findById(shopCategoryDTO.getShopId());
            if (shopDTO == null) {
                return ResponseUtils.buildError("商品不存在");
            }
            BigDecimal orderAmount = new BigDecimal(orderEntity.getOrderNum()).multiply(price);
            OrderRecordDTO orderRecordDTO = buildOrderRecordDTO(orderEntity);
            orderRecordDTO.setOrderAmount(orderAmount);
            AccountDTO accountDTO = accountService.findByUserId(userId);
            Response response = orderValidate.validate(accountDTO, orderAmount);
            if (!ResponseUtils.isSuccess(response)) {
                return response;
            }
            Long tenantId = orderEntity.getTenantId();
            TenantDTO tenantDTO = tenantService.findById(tenantId);
            orderRecordDTO.setOrderStatus(OrderStatus.INIT_ING.name());
            orderRecordDTO.setUserId(userId);
            orderRecordDTO.setTenantId(tenantId);
            orderRecordDTO.setPrice(price);
            orderRecordDTO.setTenantName(tenantDTO.getName());
            orderRecordDTO.setShopCategoryId(shopCategoryDTO.getId());
            orderRecordDTO.setShopId(shopCategoryDTO.getShopId());
            orderRecordDTO.setUpdateBy(orderEntity.getOperator());
            orderRecordDTO.setCreateBy(orderEntity.getOperator());
            orderRecordDTO.setShopName(shopDTO.getName());
            orderRecordDTO.setShopCategoryName(shopCategoryDTO.getName());
            orderRecordDTO.setChannel(orderEntity.getChannel());
            orderRecordDTO.setExternalOrderRecordId(orderEntity.getExternalOrderRecordId());
            orderRecordDTO.setExternalOrderId(orderEntity.getExternalOrderId());
            orderRecordDTO.setExternalOrderPrice(orderEntity.getExternalOrderPrice());
            orderRecordDTO.setExternalOrderAmount(orderEntity.getExternalOrderAmount());
            Long orderId = orderRecordService.save(orderRecordDTO);
            orderEntity.setId(orderId);
            orderEntity.setUserId(userId);
            orderEntity.setOrderStatus(OrderStatus.INIT_ING.name());
            orderEntity.setShopCategoryId(shopCategoryDTO.getId());
            orderEntity.setShopId(shopCategoryDTO.getShopId());
            //保存附加属性
            OrderRecordExtParamDTO orderRecordExtParamDTO = orderEntity.getOrderRecordExtParamDTO();
            if(orderRecordExtParamDTO!=null) {
                orderRecordExtParamDTO.setOrderRecordId(orderId);
                orderRecordExtParamService.save(orderRecordExtParamDTO);
            }
            orderQueue.submit(orderEntity, OrderConsumerConfig.SUBMIT, userId);
            JSONObject data = new JSONObject();
            data.put("orderId", orderId.toString());
            return ResponseUtils.buildSuccess("下单请求已发送", data);
        } catch (Exception e) {
            log.error("submit user order by {} and {} error:", userId, orderEntity, e);
            return ResponseUtils.buildError("下单发生未知异常");
        }
    }

    private OrderRecordDTO buildOrderRecordDTO(OrderEntity orderEntity) {
        OrderRecordDTO orderRecordDTO = new OrderRecordDTO();
        BeanUtils.copyProperties(orderEntity, orderRecordDTO);
        return orderRecordDTO;
    }

}
