package com.kakrolot.web.convert.account;

import com.kakrolot.common.utils.AmountUtils;
import com.kakrolot.service.account.api.dto.AccountDetailDTO;
import com.kakrolot.service.account.api.dto.QueryAccountDetailDTO;
import com.kakrolot.service.order.api.OrderRecordService;
import com.kakrolot.service.order.api.RefundOrderService;
import com.kakrolot.service.order.api.dto.OrderRecordDTO;
import com.kakrolot.service.order.api.dto.OrderRefundRecordDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.PageModel;
import com.kakrolot.web.model.account.AccountDetailModel;
import com.kakrolot.web.model.account.AccountRechargeModel;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class AccountDetailWebConverter extends WebConvert<AccountDetailDTO, AccountDetailModel> {

    @Autowired
    private OrderRecordService orderRecordService;

    @Autowired
    private RefundOrderService refundOrderService;

    public QueryAccountDetailDTO toQueryDTO(AccountDetailModel accountDetailModel, int startIndex, int pageSize) {
        try {
            QueryAccountDetailDTO queryAccountDetailDTO = new QueryAccountDetailDTO();
            BeanUtils.copyProperties(accountDetailModel, queryAccountDetailDTO);
            String startTime = accountDetailModel.getStartTime();
            if (StringUtils.isNotBlank(startTime)) {
                queryAccountDetailDTO.setStartTime(DateUtils.parseDate(startTime, "yyyy-MM-dd hh:mm:ss"));
            }
            String endTime = accountDetailModel.getEndTime();
            if (StringUtils.isNotBlank(endTime)) {
                queryAccountDetailDTO.setEndTime(DateUtils.parseDate(endTime, "yyyy-MM-dd hh:mm:ss"));
            }
            queryAccountDetailDTO.setStartIndex(startIndex);
            queryAccountDetailDTO.setPageSize(pageSize);
            return queryAccountDetailDTO;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

    public PageModel<AccountDetailModel> toPageModel(List<QueryAccountDetailDTO> queryAccountDetailDTOs, Long count) {
        PageModel<AccountDetailModel> pageModel = new PageModel<>();
        pageModel.setTotal(count);
        pageModel.setItems(toQueryModels(queryAccountDetailDTOs));
        return pageModel;
    }

    private List<AccountDetailModel> toQueryModels(List<QueryAccountDetailDTO> queryAccountDetailDTOs) {
        if (queryAccountDetailDTOs == null) {
            return Collections.emptyList();
        }
        return queryAccountDetailDTOs.stream().map(this::toQueryModel).collect(Collectors.toList());
    }

    private AccountDetailModel toQueryModel(QueryAccountDetailDTO queryAccountDetailDTO) {
        AccountDetailModel accountDetailModel = new AccountDetailModel();
        BeanUtils.copyProperties(queryAccountDetailDTO, accountDetailModel);
        accountDetailModel.setBalanceAmount(queryAccountDetailDTO.getBalanceAmount());
        accountDetailModel.setAmount(queryAccountDetailDTO.getAmount());
        accountDetailModel.setUpdateTimeStr(com.kakrolot.common.utils.DateUtils
                .formatDate(com.kakrolot.common.utils.DateUtils.TimeType.yyyy_MM_ddHHmmSS,queryAccountDetailDTO.getUpdateTime()));
        accountDetailModel.setTinyUrl(getTinyUrl(queryAccountDetailDTO.getBusinessId()));
        return accountDetailModel;
    }

    /**
     * 转换SUBMIT_159923为短链接
     * @param businessId
     * @return
     */
    private String getTinyUrl(String businessId){
        try {
            String regex = "[A-Z]+_";
            Pattern pattern = Pattern.compile(regex);
            Matcher matcher = pattern.matcher(businessId);
            if (matcher.find()) {
                String prefix = matcher.group(0);
                String orderRecordId = businessId.replace(prefix, "");
                if("REFUND_".equals(prefix)) {
                    OrderRefundRecordDTO orderRefundRecordDTO = refundOrderService.findById(Long.valueOf(orderRecordId));
                    OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderRefundRecordDTO.getOrderId());
                    return orderRecordDTO.getTinyUrl();
                } else {
                    OrderRecordDTO orderRecordDTO = orderRecordService.findById(Long.valueOf(orderRecordId));
                    return orderRecordDTO.getTinyUrl();
                }
            }
            return "";
        } catch (Exception e) {
            return "";
        }
    }

    public List<AccountRechargeModel> toRechargeModel(List list) {
        List<AccountRechargeModel> rechargeModelList = new ArrayList<>();
        if (CollectionUtils.isNotEmpty(list)) {
            for (Object row : list) {
                Object[] cells = (Object[]) row;
                String businessId = String.valueOf(cells[0]);
                String username = String.valueOf(cells[1]);
                String remark = String.valueOf(cells[2]);
                BigDecimal amount = (BigDecimal) cells[3];
                String description = String.valueOf(cells[4]);
                String operator = String.valueOf(cells[5]);
                Date createTime = (Date) cells[6];
                AccountRechargeModel accountRechargeModel = new AccountRechargeModel();
                accountRechargeModel.setBusinessId(businessId);
                accountRechargeModel.setUsername(username);
                accountRechargeModel.setRemark(remark);
                accountRechargeModel.setAmount(amount);
                accountRechargeModel.setDescription(description);
                accountRechargeModel.setOperator(operator);
                accountRechargeModel.setOperatorTime(com.kakrolot.common.utils.DateUtils.formatDate(com.kakrolot.common.utils.DateUtils.TimeType.yyyy_MM_ddHHmmSS,createTime));
                rechargeModelList.add(accountRechargeModel);
            }
        }
        return rechargeModelList;
    }

}
