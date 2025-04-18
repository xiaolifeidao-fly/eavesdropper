package com.kakrolot.business.service.account;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.common.dto.BaseDTO;
import com.kakrolot.common.utils.DateUtils;
import com.kakrolot.service.account.api.AccountDetailService;
import com.kakrolot.service.account.api.ChargeJnlService;
import com.kakrolot.service.account.api.ProfitPayService;
import com.kakrolot.service.account.api.dto.AmountType;
import com.kakrolot.service.account.api.dto.ChargeJnlDTO;
import com.kakrolot.service.account.api.dto.ProfitPayDTO;
import com.kakrolot.service.account.api.dto.ProfitStatus;
import com.kakrolot.service.dictionary.DictionaryService;
import com.kakrolot.service.dictionary.dto.DictionaryDTO;
import com.kakrolot.service.order.api.OrderRecordService;
import com.kakrolot.service.order.api.dto.OrderStatus;
import com.kakrolot.service.shop.api.ShopGroupService;
import com.kakrolot.service.shop.api.ShopService;
import com.kakrolot.service.shop.api.dto.ShopDTO;
import com.kakrolot.service.shop.api.dto.ShopGroupDTO;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.apache.commons.lang3.time.DateFormatUtils;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ProfitService implements InitializingBean {

    @Autowired
    private ProfitPayService profitPayService;

    @Autowired
    private ChargeJnlService chargeJnlService;

    @Autowired
    private DictionaryService dictionaryService;

    @Autowired
    private AccountDetailService accountDetailService;

    @Autowired
    private OrderRecordService orderRecordService;

    @Value("${barry.query.url:}")
    private String bladeQueryUrl;

    @Autowired
    private ShopService shopService;

    @Autowired
    private ShopGroupService shopGroupService;

    @Value("${profit.cal.flag:false}")
    private boolean calFlag;

    @Scheduled(cron = "0 30 * * * ?")
    public void flushProfit() {
        try {
            if (!calFlag) {
                return;
            }
            init();
            List<ProfitPayDTO> pendingProfitPayDTOs = profitPayService.findByStatus(ProfitStatus.PENDING.name());
            if (pendingProfitPayDTOs == null) {
                return;
            }
            for (ProfitPayDTO profitPayDTO : pendingProfitPayDTOs) {
                List<ShopGroupDTO> shopGroupDTOs = shopGroupService.findBySettleFlag(true);
                List<ChargeJnlDTO> chargeJnlDTOList = new ArrayList<>();
                for (ShopGroupDTO shopGroupDTO : shopGroupDTOs) {
                    Long profitPayId = profitPayDTO.getId();
                    String type = shopGroupDTO.getChargeType();
                    ChargeJnlDTO chargeJnlDTO = chargeJnlService.findByProfitPayIdAndType(profitPayId, type);
                    if (chargeJnlDTO == null) {
                        chargeJnlDTO = saveChargeJnl(profitPayId, type);
                    }
                    if (ProfitStatus.PENDING.name().equals(chargeJnlDTO.getStatus())) {
                        fillChargeJnl(chargeJnlDTO, shopGroupDTO, profitPayDTO.getDate());
                    }
                    chargeJnlDTOList.add(chargeJnlDTO);
                }
                fillProfitPayDTO(profitPayDTO, chargeJnlDTOList);
            }
        } catch (Exception e) {
            log.error("flushProfit flush error:", e);
        }
    }

    private void init() {
        Date today = DateUtils.getTodayStart();
        ProfitPayDTO profitPayDTO = profitPayService.findByDate(today);
        if (profitPayDTO == null) {
            saveProfitPay(today);
        }
    }

    private void fillProfitPayDTO(ProfitPayDTO profitPayDTO, List<ChargeJnlDTO> chargeJnlDTOList) {
        Date profitDate = profitPayDTO.getDate();
        BigDecimal inAmount = getInAmount(profitDate);
        BigDecimal outAmount = getOutAmount(chargeJnlDTOList);
        BigDecimal profitAmount = inAmount.subtract(outAmount);
        profitPayDTO.setInAmount(inAmount);
        profitPayDTO.setOutAmount(outAmount);
        profitPayDTO.setProfitAmount(profitAmount);
        if (isDone(profitDate)) {
            profitPayDTO.setStatus(ProfitStatus.DONE.name());
        }
        profitPayService.save(profitPayDTO);
    }

    public BigDecimal getInAmount(Date profitDate) {
        Date start = profitDate;
        Date end = DateUtils.addDate(start, 1);
        BigDecimal consumerAmount = accountDetailService.findAmountByDateAndType(start, end, AmountType.CONSUMER.name());
        if (consumerAmount == null) {
            consumerAmount = BigDecimal.ZERO;
        }
        BigDecimal refundAmount = accountDetailService.findAmountByDateAndType(start, end, AmountType.REFUND.name());
        if (refundAmount == null) {
            refundAmount = BigDecimal.ZERO;
        }
        BigDecimal bkAmount = accountDetailService.findAmountByDateAndType(start, end, AmountType.BK.name());
        if (bkAmount == null) {
            bkAmount = BigDecimal.ZERO;
        }
        BigDecimal inAmount = consumerAmount.subtract(refundAmount).subtract(bkAmount);

        try {
            BigDecimal scale = getScale();
            if (scale == null || scale.compareTo(BigDecimal.ZERO) == 0) {
                return inAmount;
            }
            BigDecimal inAmountD = inAmount;
            BigDecimal scaleAmount = inAmountD.multiply(scale);
            inAmountD = inAmountD.subtract(scaleAmount);
            return inAmountD;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public BigDecimal getScale() {
        try {
            DictionaryDTO dictionaryDTO = dictionaryService.getByCode("CLEAR_DATE");
            String clearDate = dictionaryDTO.getValue();
            Date today = DateUtils.getTodayStart();
            Date clearDateStart = org.apache.commons.lang3.time.DateUtils.parseDate(clearDate, "yyyy-MM-dd");
            BigDecimal payAmount = accountDetailService.findAmountByDateAndType(clearDateStart, today, AmountType.PAY.name());
            if (payAmount == null || payAmount.compareTo(BigDecimal.ZERO) == 0) {
                return null;
            }
            BigDecimal givenAmount = accountDetailService.findAmountByDateAndType(clearDateStart, today, AmountType.GIVEN.name());
            return givenAmount.divide(payAmount, 3, BigDecimal.ROUND_UP);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private boolean isDone(Date profitDate) {
        Date start = profitDate;
        Date end = DateUtils.addDate(start, 1);
        Long count = orderRecordService.countByDateAndOrderStatusIn(start, end, Arrays.asList(OrderStatus.INIT.name(), OrderStatus.PENDING.name()));
        if (count > 0) {
            return false;
        }
        return true;
    }

    private BigDecimal getOutAmount(List<ChargeJnlDTO> chargeJnlDTOList) {
        BigDecimal outAmount = BigDecimal.ZERO;
        for (ChargeJnlDTO chargeJnlDTO : chargeJnlDTOList) {
            outAmount = chargeJnlDTO.getPrice().multiply(BigDecimal.valueOf(chargeJnlDTO.getNum())).add(outAmount);
        }
        return outAmount;
    }

    private void fillChargeJnl(ChargeJnlDTO chargeJnlDTO, ShopGroupDTO shopGroupDTO, Date profitDate) {
        BigDecimal price = chargeJnlDTO.getPrice();
        if (price == null) {
            price = shopGroupDTO.getPrice() == null ? 
            BigDecimal.ZERO : 
            new BigDecimal(shopGroupDTO.getPrice());
            chargeJnlDTO.setPrice(price);
        }
        if (shopGroupDTO.getCalRgFlag()) {
            Long doneNum = findNum(Collections.singletonList(shopGroupDTO.getBusinessType()), profitDate, OrderStatus.DONE.name());
            chargeJnlDTO.setNum(doneNum);
            Long waitNum = findNum(Collections.singletonList(shopGroupDTO.getBusinessType()), profitDate, "WAIT");
            if (waitNum == null || waitNum == 0) {
                chargeJnlDTO.setStatus(ProfitStatus.DONE.name());
            }
        } else {
            List<ShopDTO> shopDTOs = shopService.findAllByShopGroupId(shopGroupDTO.getId());
            List<Long> shopIds = shopDTOs.stream().map(BaseDTO::getId).collect(Collectors.toList());
            Date end = DateUtils.addDate(profitDate, 1);
            Long count = orderRecordService.countByDateAndOrderStatusInAndShopIdIn(profitDate, end, Arrays.asList(OrderStatus.INIT.name(), OrderStatus.PENDING.name()), shopIds);
            Long doneNum = orderRecordService.getActualDoneSummary(shopIds, profitDate, end);
            if (doneNum == null || doneNum < 0L) {
                doneNum = 0L;
            }
            chargeJnlDTO.setNum(doneNum);
            if (count == 0 && profitDate.before(DateUtils.getTodayStart())) {
                chargeJnlDTO.setStatus(ProfitStatus.DONE.name());
            }
        }
        chargeJnlService.save(chargeJnlDTO);

    }

    private Long findNum(List<String> types, Date date, String status) {
        String start = DateFormatUtils.format(date, "yyyy-MM-dd");
        String end = DateFormatUtils.format(DateUtils.addDate(date, 1), "yyyy-MM-dd");
        StringBuffer typeStr = new StringBuffer();
        for (String type : types) {
            typeStr.append(type + ",");
        }
        String type = typeStr.deleteCharAt(typeStr.length() - 1).toString();
        String queryUserTaskUrl = bladeQueryUrl + "/userTasks/sum?startDate=" + start + "&endDate=" + end + "&types=" + type + "&status=" + status;
        Response response = null;
        try {
            log.info("bladeQueryUrl :{}", bladeQueryUrl);
            response = OkHttpUtils.doGet(queryUserTaskUrl, null);
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            return jsonObject.getLong("num");
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }

    private ChargeJnlDTO saveChargeJnl(Long profitPayId, String type) {
        ChargeJnlDTO chargeJnlDTO = new ChargeJnlDTO();
        chargeJnlDTO.setType(type);
        chargeJnlDTO.setProfitPayId(profitPayId);
        chargeJnlDTO.setStatus(ProfitStatus.PENDING.name());
        return chargeJnlService.save(chargeJnlDTO);
    }

    private ProfitPayDTO saveProfitPay(Date today) {
        ProfitPayDTO profitPayDTO = new ProfitPayDTO();
        profitPayDTO.setDate(today);
        profitPayDTO.setStatus(ProfitStatus.PENDING.name());
        return profitPayService.save(profitPayDTO);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        flushProfit();
    }
}
