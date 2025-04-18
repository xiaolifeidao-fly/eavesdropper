package com.kakrolot.web.convert.order;

import com.alibaba.excel.util.CollectionUtils;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.kakrolot.common.utils.AmountUtils;
import com.kakrolot.service.dashboard.api.dto.OrderSummaryDTO;
import com.kakrolot.service.dashboard.api.dto.QueryOrderSummaryDTO;
import com.kakrolot.service.order.api.OrderRecordExtParamService;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.order.api.dto.OrderRecordExtParamDTO;
import com.kakrolot.service.order.api.dto.OrderStatus;
import com.kakrolot.service.order.api.dto.QueryOrderDTO;
import com.kakrolot.service.shop.api.ShopExtParamService;
import com.kakrolot.service.shop.api.dto.ShopExtParamDTO;
import com.kakrolot.service.shop.api.dto.ShopGroupDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.PageModel;
import com.kakrolot.web.model.order.*;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class OrderWebConvert extends WebConvert<OrderRecordDTO, OrderRecordModel> {

    @Autowired
    private OrderRecordExtParamService orderRecordExtParamService;

    @Autowired
    private ShopExtParamService shopExtParamService;

    public List<ShopGroupModel> toShopGroupModels(List<ShopGroupDTO> shopGroupDTOS) {
        if (CollectionUtils.isEmpty(shopGroupDTOS)) {
            return Collections.emptyList();
        }
        List<ShopGroupModel> shopGroupModels = new ArrayList<>();
        HashMap<String, String> shopGroupMap = new HashMap<>();
        shopGroupDTOS.forEach(shopGroupDTO -> {
            shopGroupMap.put(shopGroupDTO.getBusinessType(), shopGroupDTO.getDashboardTitle());
        });
        Set<String> strings = shopGroupMap.keySet();
        for (String businessType : strings) {
            ShopGroupModel shopGroupModel = new ShopGroupModel();
            shopGroupModel.setBusinessType(businessType);
            shopGroupModel.setGroupName(shopGroupMap.get(businessType));
            shopGroupModels.add(shopGroupModel);
        }
        return shopGroupModels;
    }

    public List<OrderSummaryModel> toOrderSummaryModels(String businessType, List<OrderSummaryDTO> orderSummaryDTOS) {
        if (CollectionUtils.isEmpty(orderSummaryDTOS)) {
            return Collections.emptyList();
        }
        return orderSummaryDTOS.stream().map(orderSummaryDTO -> toOrderSummaryModel(businessType, orderSummaryDTO)).collect(Collectors.toList());
    }

    public OrderSummaryModel toOrderSummaryModel(String businessType, OrderSummaryDTO orderSummaryDTO) {
        if (orderSummaryDTO == null) {
            return null;
        }
        OrderSummaryModel orderSummaryModel = new OrderSummaryModel();
        BeanUtils.copyProperties(orderSummaryDTO, orderSummaryModel);
//        if (BusinessCode.DY_HS_UU.name().equals(businessCode)) {
//            //该渠道下自然量5%
//            orderSummaryModel.setRefundCounts((long) (orderSummaryModel.getRefundCounts() * 0.95));
//            orderSummaryModel.setDoneCounts((long) (orderSummaryModel.getDoneCounts() * 0.95));
//        }
        return orderSummaryModel;
    }

    public PageModel<QueryOrderExternalModel> toPageExternalModel(Long count, List<QueryOrderDTO> queryOrderDTOs) {
        PageModel<QueryOrderExternalModel> pageModel = new PageModel<>();
        pageModel.setTotal(count);
        pageModel.setItems(toQueryExternalOrderModels(queryOrderDTOs));
        return pageModel;
    }

    public PageModel<QueryOrderModel> toPageModel(Long count, List<QueryOrderDTO> queryOrderDTOs) {
        PageModel<QueryOrderModel> pageModel = new PageModel<>();
        pageModel.setTotal(count);
        pageModel.setItems(toQueryOrderModels(queryOrderDTOs));
        return pageModel;
    }

    private List<QueryOrderModel> toQueryOrderModels(List<QueryOrderDTO> queryOrderDTOs) {
        if (CollectionUtils.isEmpty(queryOrderDTOs)) {
            return Collections.emptyList();
        }
        Long shopId = queryOrderDTOs.get(0).getShopId();
        List<ShopExtParamDTO> shopExtParamDTOList = shopExtParamService.findByShopId(shopId);
        return queryOrderDTOs.stream().map(queryOrderDTO ->
                this.toQueryOrderModel(queryOrderDTO, shopExtParamDTOList)).collect(Collectors.toList());
    }

    private QueryOrderModel toQueryOrderModel(QueryOrderDTO queryOrderDTO, List<ShopExtParamDTO> shopExtParamDTOList) {
        QueryOrderModel queryOrderModel = new QueryOrderModel();
        BeanUtils.copyProperties(queryOrderDTO, queryOrderModel);
        queryOrderModel.setOrderAmount(queryOrderDTO.getOrderAmount());
        OrderStatus orderStatus = OrderStatus.valueOf(queryOrderDTO.getOrderStatus());
        if (StringUtils.isNotBlank(queryOrderDTO.getRefundStatus())) {
            OrderStatus refundStatus = OrderStatus.valueOf(queryOrderDTO.getRefundStatus());
            if (refundStatus.getIndex() > orderStatus.getIndex()) {
                orderStatus = refundStatus;
            }
        }
        queryOrderModel.setPrice(queryOrderDTO.getPrice());
        queryOrderModel.setOrderStatus(orderStatus.name());
        queryOrderModel.setOrderStatusShow(orderStatus.getDesc());
        queryOrderModel.setCreateTime(queryOrderDTO.getCreateTime());
        queryOrderModel.setOrderCreateTime(com.kakrolot.common.utils.DateUtils
                .formatDate(com.kakrolot.common.utils.DateUtils.TimeType.yyyy_MM_ddHHmmSS, queryOrderDTO.getCreateTime()));
        queryOrderModel.setOrderUpdateTime(com.kakrolot.common.utils.DateUtils
                .formatDate(com.kakrolot.common.utils.DateUtils.TimeType.yyyy_MM_ddHHmmSS, queryOrderDTO.getUpdateTime()));
        //附加属性

        if (!CollectionUtils.isEmpty(shopExtParamDTOList)) {
            //先构造空的属性列表
            List<QueryOrderModel.ExtParamModel> emptyModels = shopExtParamDTOList.stream().map(shopExtParamDTO -> {
                QueryOrderModel.ExtParamModel extParamModel = new QueryOrderModel().new ExtParamModel();
                extParamModel.setShopExtParamId(shopExtParamDTO.getId());
                extParamModel.setCode(shopExtParamDTO.getCode());
                extParamModel.setName(shopExtParamDTO.getName());
                extParamModel.setParamStr("");
                return extParamModel;
            }).collect(Collectors.toList());
            OrderRecordExtParamDTO orderRecordExtParamDTO = orderRecordExtParamService.findByOrderRecordId(queryOrderDTO.getId());
            if (orderRecordExtParamDTO != null) {
                String innerParams = orderRecordExtParamDTO.getInnerParams();
                if (StringUtils.isNotBlank(innerParams)) {
                    //[{"shopExtParamId":3,"value":"一禅小和尚"}]
                    JSONArray paramsArray = JSON.parseArray(innerParams);
                    if (!CollectionUtils.isEmpty(paramsArray)) {
                        List<QueryOrderModel.ExtParamModel> extParamModelList = new ArrayList<>();
                        for (int i = 0; i < paramsArray.size(); i++) {
                            QueryOrderModel.ExtParamModel extParamModel = new QueryOrderModel().new ExtParamModel();
                            JSONObject jsonObject = paramsArray.getJSONObject(i);
                            Long shopExtParamId = jsonObject.getLong("shopExtParamId");
                            String value = jsonObject.getString("value");
                            ShopExtParamDTO shopExtParamDTO = shopExtParamService.getById(shopExtParamId);
                            extParamModel.setCode(shopExtParamDTO.getCode());
                            extParamModel.setName(shopExtParamDTO.getName());
                            extParamModel.setParamStr(value);
                            extParamModel.setShopExtParamId(shopExtParamId);
                            extParamModelList.add(extParamModel);
                        }
                        queryOrderModel.setExtParamModelList(extParamModelList);
                    }
                } else {
                    queryOrderModel.setExtParamModelList(emptyModels);
                }
            } else {
                queryOrderModel.setExtParamModelList(emptyModels);
            }
        }

        return queryOrderModel;
    }

    private List<QueryOrderExternalModel> toQueryExternalOrderModels(List<QueryOrderDTO> queryOrderDTOs) {
        if (queryOrderDTOs == null) {
            queryOrderDTOs = Collections.emptyList();
        }
        return queryOrderDTOs.stream().map(this::toQueryOrderExternalModel).collect(Collectors.toList());
    }

    private QueryOrderExternalModel toQueryOrderExternalModel(QueryOrderDTO queryOrderDTO) {
        QueryOrderExternalModel queryOrderExternalModel = new QueryOrderExternalModel();
        BeanUtils.copyProperties(queryOrderDTO, queryOrderExternalModel);
        OrderStatus orderStatus = OrderStatus.valueOf(queryOrderDTO.getOrderStatus());
        if (StringUtils.isNotBlank(queryOrderDTO.getRefundStatus())) {
            OrderStatus refundStatus = OrderStatus.valueOf(queryOrderDTO.getRefundStatus());
            if (refundStatus.getIndex() > orderStatus.getIndex()) {
                orderStatus = refundStatus;
            }
        }
        queryOrderExternalModel.setOrderStatus(orderStatus.name());
        queryOrderExternalModel.setOrderStatusShow(orderStatus.getDesc());
        queryOrderExternalModel.setCreateTime(queryOrderDTO.getCreateTime());
        queryOrderExternalModel.setOrderCreateTime(com.kakrolot.common.utils.DateUtils
                .formatDate(com.kakrolot.common.utils.DateUtils.TimeType.yyyy_MM_ddHHmmSS, queryOrderDTO.getCreateTime()));
        queryOrderExternalModel.setOrderUpdateTime(com.kakrolot.common.utils.DateUtils
                .formatDate(com.kakrolot.common.utils.DateUtils.TimeType.yyyy_MM_ddHHmmSS, queryOrderDTO.getUpdateTime()));
        return queryOrderExternalModel;
    }

    public QueryOrderSummaryDTO toQueryOrderSummaryDTO(QueryOrderSummaryModel queryOrderSummaryModel) {
        try {
            QueryOrderSummaryDTO queryOrderSummaryDTO = new QueryOrderSummaryDTO();
            BeanUtils.copyProperties(queryOrderSummaryModel, queryOrderSummaryDTO);
            return queryOrderSummaryDTO;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public QueryOrderDTO toQueryDTO(QueryOrderModel queryOrderModel, int startIndex, int pageSize) {
        try {
            QueryOrderDTO queryOrderDTO = new QueryOrderDTO();
            BeanUtils.copyProperties(queryOrderModel, queryOrderDTO);
            String startTime = queryOrderModel.getStartTime();
            if (StringUtils.isNotBlank(startTime)) {
                queryOrderDTO.setStartTime(DateUtils.parseDate(startTime, "yyyy-MM-dd hh:mm:ss"));
            }
            String endTime = queryOrderModel.getEndTime();
            if (StringUtils.isNotBlank(endTime)) {
                queryOrderDTO.setEndTime(DateUtils.parseDate(endTime, "yyyy-MM-dd hh:mm:ss"));
            }
            String tinyUrl = queryOrderModel.getTinyUrl();
            if (StringUtils.isNotBlank(tinyUrl)) {
                queryOrderDTO.setTinyUrl(tinyUrl);
            }
            String orderStatusShow = queryOrderModel.getOrderStatusShow();
            if (StringUtils.isNotBlank(orderStatusShow)) {
                queryOrderDTO.setOrderStatus(OrderStatus.getOrderStatusByDesc(orderStatusShow).name());
            }
            String orderStatus = queryOrderDTO.getOrderStatus();
            if("REFUND_PENDING".equals(orderStatus) ||"REFUND_HANDING".equals(orderStatus) ||"REFUND".equals(orderStatus)) {
                queryOrderDTO.setOrderStatus("");
                queryOrderDTO.setRefundStatus(orderStatus);
            }
            String userName = queryOrderModel.getUserName();
            if (StringUtils.isNotBlank(userName)) {
                queryOrderDTO.setUserName(userName);
            }
            queryOrderDTO.setStartIndex(startIndex);
            queryOrderDTO.setPageSize(pageSize);
            return queryOrderDTO;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }
}
