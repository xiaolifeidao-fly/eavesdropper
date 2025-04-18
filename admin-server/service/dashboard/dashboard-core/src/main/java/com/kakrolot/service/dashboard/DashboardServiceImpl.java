package com.kakrolot.service.dashboard;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.business.service.user.UserTenantService;
import com.kakrolot.common.dto.BaseDTO;
import com.kakrolot.common.utils.DateUtils;
import com.kakrolot.service.account.api.dto.AmountType;
import com.kakrolot.service.dashboard.api.DashboardService;
import com.kakrolot.service.dashboard.api.dto.*;
import com.kakrolot.service.order.api.dto.OrderStatus;
import com.kakrolot.service.order.dao.repository.OrderBkRecordRepository;
import com.kakrolot.service.order.dao.repository.OrderRecordRepository;
import com.kakrolot.service.shop.api.ShopCategoryService;
import com.kakrolot.service.shop.api.ShopGroupService;
import com.kakrolot.service.shop.api.ShopService;
import com.kakrolot.service.shop.api.TenantShopCategoryService;
import com.kakrolot.service.shop.api.dto.ShopCategoryDTO;
import com.kakrolot.service.shop.api.dto.ShopDTO;
import com.kakrolot.service.shop.api.dto.ShopGroupDTO;
import com.kakrolot.service.shop.api.dto.TenantShopCategoryDTO;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by roc_peng on 2020/5/14.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Service
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    @Value("${barry.url.inner.prefix:http://127.0.0.1:9999}")
    private String barryInnerPrefix;

    @Value("${barry.url.inner.record.summary.suffix:/order/summary?code={code}&sumDate={sumDate}}")
    private String innerRecordSummarySuffix;

    @Autowired
    private OrderRecordRepository orderRecordRepository;

    @Autowired
    private OrderBkRecordRepository orderBkRecordRepository;

    @Autowired
    private ShopService shopService;

    @Autowired
    private ShopGroupService shopGroupService;

    @Autowired
    private UserTenantService userTenantService;

    @Autowired
    private TenantShopCategoryService tenantShopCategoryService;

    @Autowired
    private ShopCategoryService shopCategoryService;

    @Override
    public OrderRecordSummary getTodayOrderRecordSummary() {
        OrderRecordSummary orderRecordSummary = new OrderRecordSummary();
        List<OrderRecordSummary.OrderRecordDetail> detailList = new ArrayList<>();
        Long totalNum = 0L;
        Long totalLoveNum = 0L;
        Long totalFollowNum = 0L;
        Long totalLiveNum = 0L;
        Long totalXhsFollowNum = 0L;
        Long totalXhsCollectNum = 0L;
        Long totalXhsLoveNum = 0L;
        List<Long> dyLoveShopIds = Arrays.asList(2L, 6L, 8L, 10L, 20L);
        List<Long> dyFollowShopIds = Arrays.asList(1L, 7L, 9L, 11L);
        List<Long> xhsFollowShopIds = Arrays.asList(19L, 21L);
        List<Long> xhsCollectShopIds = Arrays.asList(18L);
        List<Long> xhsLoveShopIds = Arrays.asList(22L, 23L);
        List orderRecords = orderRecordRepository.getOrderRecordSummary();
        if (CollectionUtils.isNotEmpty(orderRecords)) {
            for (Object row : orderRecords) {
                Object[] cells = (Object[]) row;
                String tenantName = String.valueOf(cells[0]);
                String shopName = String.valueOf(cells[1]);
                String shopCategoryName = String.valueOf(cells[2]);
                Long shopId = ((BigInteger) (cells[3])).longValue();
                Long count = ((BigInteger) cells[4]).longValue();
                totalNum += count;
                if (dyLoveShopIds.contains(shopId)) {
                    totalLoveNum += count;
                }
                if (dyFollowShopIds.contains(shopId)) {
                    totalFollowNum += count;
                }
                if (xhsFollowShopIds.contains(shopId)) {
                    totalXhsFollowNum += count;
                }
                if (xhsCollectShopIds.contains(shopId)) {
                    totalXhsCollectNum += count;
                }
                if (xhsLoveShopIds.contains(shopId)) {
                    totalXhsLoveNum += count;
                }
                OrderRecordSummary.OrderRecordDetail orderRecordDetail = new OrderRecordSummary.OrderRecordDetail();
                orderRecordDetail.setTenantName(tenantName);
                orderRecordDetail.setShopName(shopName);
                orderRecordDetail.setShopCategoryName(shopCategoryName);
                orderRecordDetail.setCount(count);
                detailList.add(orderRecordDetail);
            }
            orderRecordSummary.setTotalNum(totalNum);
            orderRecordSummary.setTotalLoveNum(totalLoveNum);
            orderRecordSummary.setTotalFollowNum(totalFollowNum);
            orderRecordSummary.setTotalXhsFollowNum(totalXhsFollowNum);
            orderRecordSummary.setTotalXhsCollectNum(totalXhsCollectNum);
            orderRecordSummary.setTotalXhsLoveNum(totalXhsLoveNum);
            orderRecordSummary.setDetailList(detailList);
        }
        return orderRecordSummary;
    }

    @Override
    public UserTaskSummary getTodayUserTaskSummaryByBusinessType(String businessType) {
        ShopGroupDTO shopGroupDTO = shopGroupService.findByBusinessType(businessType);
        return getHistoryUserTaskSummary(businessType, shopGroupDTO.getName(), DateUtils.getTodayStart(), DateUtils.getTomorrowStart());
    }

    @Override
    public UserTaskSummary getTodayUserTaskSummaryByBusinessCode(String businessCode) {
        List<ShopGroupDTO> shopGroupDTOList = shopGroupService.findAllByBusinessCode(businessCode);
        Long count = 0L;
        List<UserTaskSummary.UserTaskSummaryDetail> userTaskSummaryDetailList = new ArrayList<>();
        for (ShopGroupDTO shopGroupDTO : shopGroupDTOList) {
            UserTaskSummary userTaskSummary = getHistoryUserTaskSummary(shopGroupDTO.getBusinessType(), shopGroupDTO.getName(), DateUtils.getTodayStart(), DateUtils.getTomorrowStart());
            count += userTaskSummary.getCount();
            userTaskSummaryDetailList.addAll(userTaskSummary.getDetailList());
        }
        UserTaskSummary userTaskSummary = new UserTaskSummary();
        userTaskSummary.setCount(count);
        userTaskSummary.setDetailList(userTaskSummaryDetailList);
        return userTaskSummary;
    }

    @Override
    public ConsumeSummary getTodayConsumeSummary() {
        return getHistoryConsumeSummary(DateUtils.getTodayStartStr(), DateUtils.getTodayEndStr());
    }

    @Override
    public RechargeSummary getTodayRechargeSummary() {
        return getHistoryRechargeSummary(DateUtils.getTodayStartStr(), DateUtils.getTodayEndStr());
    }

    public RechargeSummary getHistoryRechargeSummary(String startTime, String endTime) {
        Date startDate = new Date(0);
        Date endDate = new Date();
        if (StringUtils.isNotBlank(startTime)) {
            startDate = DateUtils.parseDate(startTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        }
        if (StringUtils.isNotBlank(endTime)) {
            endDate = DateUtils.parseDate(endTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        }
        RechargeSummary rechargeSummary = new RechargeSummary();
        Double consumeSummary = orderRecordRepository.getConsumeSummary(
                Arrays.asList(AmountType.PAY.name(), AmountType.GIVEN.name()), startDate, endDate);
        if (consumeSummary == null) {
            consumeSummary = 0.0;
        }
        Double sumValue = Math.abs(consumeSummary);
        rechargeSummary.setAmount(sumValue);
        List<RechargeSummary.RechargeSummaryDetail> payList = new ArrayList<>();
        List paySummaryByUserName = orderRecordRepository.getConsumeSummaryByUserName(Arrays.asList(AmountType.PAY.name()), startDate, endDate);
        if (CollectionUtils.isNotEmpty(paySummaryByUserName)) {
            for (Object row : paySummaryByUserName) {
                Object[] cells = (Object[]) row;
                String username = String.valueOf(cells[0]);
                String remark = String.valueOf(cells[1]);
                Double amount = Math.abs(((BigDecimal) cells[2]).doubleValue());
                RechargeSummary.RechargeSummaryDetail detail = new RechargeSummary.RechargeSummaryDetail();
                detail.setUsername(username);
                detail.setRemark(remark);
                detail.setRechargeAmount(amount);
                payList.add(detail);
            }
            payList.sort(Comparator.comparing(RechargeSummary.RechargeSummaryDetail::getRechargeAmount).reversed());
        }
        List<RechargeSummary.RechargeSummaryDetail> givenList = new ArrayList<>();
        List givenSummaryByUserName = orderRecordRepository.getConsumeSummaryByUserName(Arrays.asList(AmountType.GIVEN.name()), startDate, endDate);
        if (CollectionUtils.isNotEmpty(givenSummaryByUserName)) {
            for (Object row : givenSummaryByUserName) {
                Object[] cells = (Object[]) row;
                String username = String.valueOf(cells[0]);
                String remark = String.valueOf(cells[1]);
                Double amount = Math.abs(((BigDecimal) cells[2]).doubleValue());
                RechargeSummary.RechargeSummaryDetail detail = new RechargeSummary.RechargeSummaryDetail();
                detail.setUsername(username);
                detail.setRemark(remark);
                detail.setGivenAmount(amount);
                givenList.add(detail);
            }
            givenList.sort(Comparator.comparing(RechargeSummary.RechargeSummaryDetail::getGivenAmount).reversed());
        }

        if (CollectionUtils.isNotEmpty(payList)) {
            payList.forEach(rechargeSummaryDetail -> {
                if (CollectionUtils.isNotEmpty(givenList)) {
                    Optional<RechargeSummary.RechargeSummaryDetail> any = givenList.stream().filter(rechargeSummaryDetail1 ->
                            rechargeSummaryDetail.getUsername().equals(rechargeSummaryDetail1.getUsername())).findAny();
                    if (any.isPresent()) {
                        rechargeSummaryDetail.setGivenAmount(any.get().getGivenAmount());
                    }
                }
            });
        }
        rechargeSummary.setDetailList(payList);
        return rechargeSummary;
    }

    @Override
    public UserAccountSummary getTodayUserAccountSummary() {
        UserAccountSummary userAccountSummary = new UserAccountSummary();
        List<UserAccountSummary.UserAccountSummaryDetail> detailList = new ArrayList<>();
        List accountSummary = orderRecordRepository.getUserAccountSummary();
        Double totalAmount = 0.0;
        if (CollectionUtils.isNotEmpty(accountSummary)) {
            for (Object row : accountSummary) {
                Object[] cells = (Object[]) row;
                String username = String.valueOf(cells[0]);
                String remark = String.valueOf(cells[1]);
                Double amount = Math.abs(((BigDecimal) cells[2]).doubleValue());
                totalAmount += amount;
                UserAccountSummary.UserAccountSummaryDetail detail = new UserAccountSummary.UserAccountSummaryDetail();
                detail.setUsername(username);
                detail.setRemark(remark);
                detail.setAccountAmount(amount);
                detailList.add(detail);
            }
        }
        userAccountSummary.setAmount(totalAmount);
        userAccountSummary.setDetailList(detailList);
        return userAccountSummary;
    }

    @Override
    public ActualDoneSummary getTodayActualDoneSummary() {
        return getHistoryActualDoneSummary(DateUtils.getTodayStartStr(), DateUtils.getTodayEndStr());
    }

    @Override
    public ActualDoneSummary getTodayActualDoneSummaryV2ByBusinessCode(String businessCode) {
        List<ShopDTO> shopDTOList = shopService.findAllByBusinessCode(businessCode);
        ActualDoneSummary actualDoneSummary = new ActualDoneSummary();
        actualDoneSummary.setCount(getActualDoneFromShopIds(shopDTOList));
        return actualDoneSummary;
    }

    @Override
    public ActualDoneSummary getTodayActualDoneSummaryV2ByBusinessType(String businessType) {
        List<ShopDTO> shopDTOList = shopService.findAllByBusinessType(businessType);
        ActualDoneSummary actualDoneSummary = new ActualDoneSummary();
        actualDoneSummary.setCount(getActualDoneFromShopIds(shopDTOList));
        return actualDoneSummary;
    }

    private Long getActualDoneFromShopIds(List<ShopDTO> shopDTOList) {
        if(CollectionUtils.isEmpty(shopDTOList)) {
            return 0L;
        }
        List<Long> shopIds = shopDTOList.stream().map(BaseDTO::getId).collect(Collectors.toList());
        return orderRecordRepository.getActualDoneSummary(shopIds, DateUtils.getTodayStart(), DateUtils.getTodayEnd());
    }

    @Override
    public List<OrderRecordNumSummary> getRemainTaskSummaryByBusinessCode(String businessCode) {
        List<OrderRecordNumSummary> orderRecordNumSummaryList = new ArrayList<>();
        List<ShopGroupDTO> shopGroupDTOList = shopGroupService.findAllByBusinessCode(businessCode);
        for (ShopGroupDTO shopGroupDTO : shopGroupDTOList) {
            orderRecordNumSummaryList.addAll(getRemainTaskSummaryByBusinessType(shopGroupDTO.getBusinessType()));
        }
        return orderRecordNumSummaryList;
    }

    @Override
    public List<OrderRecordNumSummary> getRemainTaskSummaryByBusinessType(String businessType) {
        List<OrderRecordNumSummary> orderRecordNumSummaryList = new ArrayList<>();
        ShopGroupDTO shopGroupDTO = shopGroupService.findByBusinessType(businessType);
        OrderRecordNumSummary orderRecordNumSummary = OrderRecordNumSummary.builder().name(shopGroupDTO.getName()).totalNum(0L).build();
        List<Long> shopIds = shopService.findAllByBusinessType(shopGroupDTO.getBusinessType()).stream().map(ShopDTO::getId).collect(Collectors.toList());
        List remainSummary = orderRecordRepository.getRemainTaskSummary(DateUtils.getTodayStart(), Collections.singletonList(OrderStatus.PENDING.name()), shopIds);
        if (CollectionUtils.isNotEmpty(remainSummary)) {
            for (Object row : remainSummary) {
                Object[] cells = (Object[]) row;
                Long refundOrders = ((BigInteger) cells[0]).longValue();
                if (refundOrders > 0) {
                    Long remainCounts = ((BigDecimal) cells[1]).longValue();
                    orderRecordNumSummary.setTotalNum(remainCounts);
                }
            }
        }
        orderRecordNumSummaryList.add(orderRecordNumSummary);
        return orderRecordNumSummaryList;
    }

    @Override
    public RemainTaskSummary getRemainTotalTaskSummary() {
        return getRemainTaskSummaryByDate(DateUtils.getTomorrowStart());
    }

    private RemainTaskSummary getRemainTaskSummaryByDate(Date startDate) {
        RemainTaskSummary remainTaskSummary = new RemainTaskSummary();
        List remainTasks = orderRecordRepository.getRemainTaskSummary(startDate);
        List<RemainTaskSummary.RemainTaskDetail> detailList = new ArrayList<>();
        Long totalNum = 0L;
        if (CollectionUtils.isNotEmpty(remainTasks)) {
            for (Object row : remainTasks) {
                Object[] cells = (Object[]) row;
                String tenantName = String.valueOf(cells[0]);
                String shopName = String.valueOf(cells[1]);
                Long count = ((BigDecimal) cells[2]).longValue();
                totalNum += count;
                RemainTaskSummary.RemainTaskDetail detail = new RemainTaskSummary.RemainTaskDetail();
                detail.setTenantName(tenantName);
                detail.setShopName(shopName);
                detail.setCount(count);
                detailList.add(detail);
            }
            remainTaskSummary.setTotalNum(totalNum);
            remainTaskSummary.setDetailList(detailList);
        }
        return remainTaskSummary;
    }


    @Override
    public OrderRecordSummary getHistoryOrderRecordSummary(String startTime, String endTime) {
        return getTodayOrderRecordSummary();
    }

    @Override
    public UserTaskSummary getHistoryUserTaskSummary(String startTime, String endTime) {
        Date startDate = DateUtils.parseDate(startTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        Date endDate = DateUtils.parseDate(endTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        UserTaskSummary userTaskSummary = new UserTaskSummary();
        Long totalCount = 0L;
        List<UserTaskSummary.UserTaskSummaryDetail> detailList = new ArrayList<>();
        List<ShopGroupDTO> shopGroupDTOList = shopGroupService.findByDashBoardActive(Boolean.TRUE);
        for (ShopGroupDTO shopGroupDTO : shopGroupDTOList) {
            UserTaskSummary historyUserTaskSummary = this.getHistoryUserTaskSummary(shopGroupDTO.getBusinessType(), shopGroupDTO.getName(), startDate, endDate);
            totalCount += historyUserTaskSummary.getCount();
            detailList.addAll(historyUserTaskSummary.getDetailList());
        }
        userTaskSummary.setCount(totalCount);
        userTaskSummary.setDetailList(detailList);
        return userTaskSummary;
    }

    public UserTaskSummary getHistoryUserTaskSummary(String businessType, String businessTypeName, Date startDate, Date endDate) {
        Response response = null;
        UserTaskSummary userTaskSummary = new UserTaskSummary();
        try {
            Long differDays = DateUtils.getDifferDays(startDate, endDate);
            startDate = DateUtils.clearHMS(startDate);
            startDate = DateUtils.addDate(startDate, -1);
            Long totalNum = 0L;
            Long pendingNum = 0L;
            Long waitNum = 0L;
            Long doneNum = 0L;
            Long errorNum = 0L;
            for (long i = 0; i < differDays; i++) {
                startDate = DateUtils.addDate(startDate, 1);
                String startDateStr = DateUtils.formatDate(DateUtils.TimeType.yyyy_MM_dd, startDate);
                String replace = innerRecordSummarySuffix.replace("{code}", businessType).replace("{sumDate}", startDateStr);
                String url = barryInnerPrefix + replace;
                response = OkHttpUtils.doGetLongTimeout(url, new JSONObject());
                String result = response.body().string();
                JSONObject jsonObject = JSONObject.parseObject(result);
                JSONObject summaryData = jsonObject.getJSONObject("data");
                totalNum += summaryData.getLong("totalNum");
                pendingNum += summaryData.getLong("pendingNum");
                waitNum += summaryData.getLong("unCheckNum");
                doneNum += summaryData.getLong("checkedNum");
                errorNum += summaryData.getLong("checkErrorNum");
            }
            userTaskSummary.setCount(waitNum + doneNum);
            List<UserTaskSummary.UserTaskSummaryDetail> userTaskSummaryDetailList = new ArrayList<>();
            UserTaskSummary.UserTaskSummaryDetail waitSummary = new UserTaskSummary.UserTaskSummaryDetail();
            waitSummary.setTaskName(businessTypeName);
            waitSummary.setStatus("审核");
            waitSummary.setCount(waitNum);
            UserTaskSummary.UserTaskSummaryDetail doneSummary = new UserTaskSummary.UserTaskSummaryDetail();
            doneSummary.setTaskName(businessTypeName);
            doneSummary.setStatus("完成");
            doneSummary.setCount(doneNum);
            userTaskSummaryDetailList.add(doneSummary);
            userTaskSummaryDetailList.add(waitSummary);
            userTaskSummary.setDetailList(userTaskSummaryDetailList);
        } catch (Exception e) {
            log.error("getHistoryUserTaskSummary-businessType-error,e is {}", e.toString());
        }
        return userTaskSummary;
    }

    @Override
    public ConsumeSummary getHistoryConsumeSummary(String startTime, String endTime) {
        Date startDate = new Date(0);
        Date endDate = new Date();
        if (StringUtils.isNotBlank(startTime)) {
            startDate = DateUtils.parseDate(startTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        }
        if (StringUtils.isNotBlank(endTime)) {
            endDate = DateUtils.parseDate(endTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        }
        ConsumeSummary consumeSummary = new ConsumeSummary();
        Double consumeValue = Math.abs(orderRecordRepository.getConsumeSummary(Collections.singletonList(AmountType.CONSUMER.name()), startDate, endDate));
        Double refund = orderRecordRepository.getConsumeSummary(Collections.singletonList(AmountType.REFUND.name()), startDate, endDate);
        refund = refund == null ? 0.0 : refund;
        refund = Math.abs(refund);
        Double bk = orderRecordRepository.getConsumeSummary(Collections.singletonList(AmountType.BK.name()), startDate, endDate);
        bk = bk == null ? 0.0 : bk;
        bk = Math.abs(bk);
        consumeSummary.setAmount(consumeValue - refund - bk);
        List<ConsumeSummary.ConsumeSummaryDetail> detailList = new ArrayList<>();
        List consumeSummaryByUserName = orderRecordRepository.getConsumeSummaryByUserName(Collections.singletonList(AmountType.CONSUMER.name()), startDate, endDate);
        if (CollectionUtils.isNotEmpty(consumeSummaryByUserName)) {
            for (Object row : consumeSummaryByUserName) {
                Object[] cells = (Object[]) row;
                String username = String.valueOf(cells[0]);
                String remark = String.valueOf(cells[1]);
                Double consumeAmount = Math.abs(((BigDecimal) cells[2]).doubleValue());
                Long accountId = ((BigInteger) cells[3]).longValue();
                Double refundAmount = orderRecordRepository.getConsumeSummaryByAccountId(Collections.singletonList(AmountType.REFUND.name()), startDate, endDate, accountId);
                refundAmount = refundAmount == null ? 0.0 : refundAmount;
                Double bkAmount = orderRecordRepository.getConsumeSummaryByAccountId(Collections.singletonList(AmountType.BK.name()), startDate, endDate, accountId);
                bkAmount = bkAmount == null ? 0.0 : bkAmount;

                ConsumeSummary.ConsumeSummaryDetail detail = new ConsumeSummary.ConsumeSummaryDetail();
                detail.setUsername(username);
                detail.setRemark(remark);
                detail.setConsumeAmount(consumeAmount);
                detail.setRefundAmount(refundAmount);
                detail.setBkAmount(bkAmount);
                detailList.add(detail);
            }
            detailList.sort(Comparator.comparing(ConsumeSummary.ConsumeSummaryDetail::getConsumeAmount).reversed());
            consumeSummary.setDetailList(detailList);
        }
        return consumeSummary;
    }

    @Override
    public ActualDoneSummary getHistoryActualDoneSummary(String startTime, String endTime) {
        Date startDate = new Date(0);
        Date endDate = new Date();
        if (StringUtils.isNotBlank(startTime)) {
            startDate = DateUtils.parseDate(startTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        }
        if (StringUtils.isNotBlank(endTime)) {
            endDate = DateUtils.parseDate(endTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        }
        ActualDoneSummary actualDoneSummary = new ActualDoneSummary();
        Long actualDone = orderRecordRepository.getActualDoneSummary(startDate, endDate);
        actualDoneSummary.setCount(actualDone);
        return actualDoneSummary;
    }

    @Override
    public OrderSummaryDTO findBySummaryCondition(QueryOrderSummaryDTO queryOrderSummaryDTO, Long userId) {
        String startTime = queryOrderSummaryDTO.getStartTime();
        String endTime = queryOrderSummaryDTO.getEndTime();
        if (StringUtils.isBlank(startTime) || StringUtils.isBlank(endTime)) {
            throw new RuntimeException("时间不能为空!");
        }
        Date startDate = DateUtils.parseDate(startTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        Date endDate = DateUtils.parseDate(endTime, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        ShopGroupDTO shopGroupDTO = shopGroupService.findByBusinessType(queryOrderSummaryDTO.getBusinessType());
        List<Long> shopIds = shopService.findAllByShopGroupId(shopGroupDTO.getId()).stream().map(ShopDTO::getId).collect(Collectors.toList());
        List<Long> shopCategoryIdsAll = shopCategoryService.findByShopIdsIn(shopIds).stream().map(ShopCategoryDTO::getId).collect(Collectors.toList());
        //从本人权限中查找对应shopIds的shopCategory
        List<Long> tenantIdsByUserId = userTenantService.getTenantIdsByUserId(userId);
        List<TenantShopCategoryDTO> tenantShopCategoryDTOList = tenantShopCategoryService.findByTenantIds(tenantIdsByUserId);
        List<Long> shopCategoryIdsByUser = tenantShopCategoryDTOList.stream().map(TenantShopCategoryDTO::getShopCategoryId).collect(Collectors.toList());
        shopCategoryIdsByUser.retainAll(shopCategoryIdsAll);

        OrderSummaryDTO orderSummaryDTO = OrderSummaryDTO.builder().name(shopGroupDTO.getDashboardTitle()).refundOrders(0L).refundCounts(0L).doneOrders(0L).doneCounts(0L).build();
        List refundSummary = orderRecordRepository.getOrderRecordSummary(shopCategoryIdsByUser, OrderStatus.REFUND.name(), startDate, endDate);
        List doneSummary = orderRecordRepository.getOrderRecordSummary(shopCategoryIdsByUser, OrderStatus.DONE.name(), startDate, endDate);
        List bkSummary = orderBkRecordRepository.getOrderBKRecordSummary(shopCategoryIdsByUser, startDate, endDate);
        if (CollectionUtils.isNotEmpty(refundSummary)) {
            for (Object row : refundSummary) {
                Object[] cells = (Object[]) row;
                Long refundOrders = ((BigInteger) cells[0]).longValue();
                if (refundOrders > 0) {
                    Long refundCounts = ((BigDecimal) cells[1]).longValue();
                    orderSummaryDTO.setRefundOrders(refundOrders);
                    orderSummaryDTO.setRefundCounts(refundCounts);
                }
            }
        }
        if (CollectionUtils.isNotEmpty(doneSummary)) {
            for (Object row : doneSummary) {
                Object[] cells = (Object[]) row;
                Long doneOrders = ((BigInteger) cells[0]).longValue();
                if (doneOrders > 0) {
                    Long doneCounts = ((BigDecimal) cells[1]).longValue();
                    orderSummaryDTO.setDoneOrders(doneOrders);
                    orderSummaryDTO.setDoneCounts(doneCounts);
                }
            }
        }
        if (CollectionUtils.isNotEmpty(bkSummary)) {
            for (Object row : bkSummary) {
                Object[] cells = (Object[]) row;
                Long bkOrders = ((BigInteger) cells[0]).longValue();
                if (bkOrders > 0) {
                    Long bkCounts = ((BigDecimal) cells[1]).longValue();
                    orderSummaryDTO.setBkOrders(bkOrders);
                    orderSummaryDTO.setBkCounts(bkCounts);
                }
            }
        }
        return orderSummaryDTO;
    }

    @Override
    public List<OrderRecordNumSummary> findOrderRecordNumSummaryByBusinessCode(String businessCode) {
        List<OrderRecordNumSummary> orderRecordNumSummaryList = new ArrayList<>();
        List<ShopGroupDTO> shopGroupDTOList = shopGroupService.findAllByBusinessCode(businessCode);
        for (ShopGroupDTO shopGroupDTO : shopGroupDTOList) {
            orderRecordNumSummaryList.addAll(findOrderRecordNumSummaryByBusinessType(shopGroupDTO.getBusinessType()));
        }
        return orderRecordNumSummaryList;
    }

    @Override
    public List<OrderRecordNumSummary> findOrderRecordNumSummaryByBusinessType(String businessType) {
        List<OrderRecordNumSummary> orderRecordNumSummaryList = new ArrayList<>();
        ShopGroupDTO shopGroupDTO = shopGroupService.findByBusinessType(businessType);
        OrderRecordNumSummary orderRecordNumSummary = OrderRecordNumSummary.builder().name(shopGroupDTO.getName()).totalNum(0L).build();
        List<Long> shopIds = shopService.findAllByBusinessType(shopGroupDTO.getBusinessType()).stream().map(ShopDTO::getId).collect(Collectors.toList());
        List pendingSummary = orderRecordRepository.getOrderRecordSummary(shopIds, OrderStatus.PENDING.name());
        if (CollectionUtils.isNotEmpty(pendingSummary)) {
            for (Object row : pendingSummary) {
                Object[] cells = (Object[]) row;
                Long refundOrders = ((BigInteger) cells[0]).longValue();
                if (refundOrders > 0) {
                    Long pendingCounts = ((BigDecimal) cells[1]).longValue();
                    orderRecordNumSummary.setTotalNum(pendingCounts);
                }
            }
            orderRecordNumSummaryList.add(orderRecordNumSummary);
        }
        return orderRecordNumSummaryList;
    }

    @Override
    public OrderRecordCountSummary findOrderRecordCountSummaryByBusinessType(String businessType) {
        ShopGroupDTO shopGroupDTO = shopGroupService.findByBusinessType(businessType);
        List<Long> shopIds = shopService.findAllByBusinessType(shopGroupDTO.getBusinessType()).stream().map(ShopDTO::getId).collect(Collectors.toList());
        Long count = orderRecordRepository.countByDateAndOrderStatusInAndShopIdIn(Collections.singletonList(OrderStatus.PENDING.name()), shopIds);
        return OrderRecordCountSummary.builder().name(shopGroupDTO.getName()).totalCount(count).build();
    }

    @Override
    public List<OrderRecordCountSummary> findOrderRecordCountSummaryByBusinessCode(String businessCode) {
        List<OrderRecordCountSummary> orderRecordCountSummaryList = new ArrayList<>();
        List<ShopGroupDTO> shopGroupDTOList = shopGroupService.findAllByBusinessCode(businessCode);
        for (ShopGroupDTO shopGroupDTO : shopGroupDTOList) {
            List<Long> shopIds = shopService.findAllByBusinessType(shopGroupDTO.getBusinessType()).stream().map(ShopDTO::getId).collect(Collectors.toList());
            Long count = orderRecordRepository.countByDateAndOrderStatusInAndShopIdIn(Collections.singletonList(OrderStatus.PENDING.name()), shopIds);
            OrderRecordCountSummary orderRecordCountSummary = OrderRecordCountSummary.builder().name(shopGroupDTO.getName()).totalCount(count).build();
            orderRecordCountSummaryList.add(orderRecordCountSummary);
        }
        return orderRecordCountSummaryList;
    }

    @Override
    public List<DashBoardConfigDTO> getDashBoardConfigList() {
        List<ShopGroupDTO> shopGroupDTOList = shopGroupService.findByDashBoardActive(Boolean.TRUE);
        return shopGroupDTOList.stream().sorted(Comparator.comparing(ShopGroupDTO::getDashboardSortId)).map(shopGroupDTO -> {
            DashBoardConfigDTO dashBoardConfigDTO = new DashBoardConfigDTO();
            dashBoardConfigDTO.setBusinessType(shopGroupDTO.getBusinessType());
            dashBoardConfigDTO.setTitle(shopGroupDTO.getDashboardTitle());
            return dashBoardConfigDTO;
        }).collect(Collectors.toList());
    }
}
