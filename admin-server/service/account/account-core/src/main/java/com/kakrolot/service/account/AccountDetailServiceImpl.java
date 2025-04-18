package com.kakrolot.service.account;

import com.kakrolot.common.utils.DateUtils;
import com.kakrolot.service.account.api.AccountDetailService;
import com.kakrolot.service.account.api.dto.AccountDetailDTO;
import com.kakrolot.service.account.api.dto.AmountType;
import com.kakrolot.service.account.api.dto.QueryAccountDetailDTO;
import com.kakrolot.service.account.convert.AccountDetailConverter;
import com.kakrolot.service.account.dao.po.AccountDetail;
import com.kakrolot.service.account.dao.repository.AccountDetailRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@Slf4j
public class AccountDetailServiceImpl implements AccountDetailService {

    @Autowired
    private AccountDetailRepository accountDetailRepository;

    @Autowired
    private AccountDetailConverter accountDetailConverter;


    @Override
    public void save(AccountDetailDTO accountDetailDTO) {
        AccountDetail accountDetail = accountDetailConverter.toPo(accountDetailDTO);
        accountDetailRepository.save(accountDetail);
    }

    @Override
    public Long countByCondition(QueryAccountDetailDTO queryAccountDetailDTO, Long accountId) {
        queryAccountDetailDTO.setAccountId(accountId);
        StringBuffer sql = new StringBuffer();
        sql.append("select count(1) ")
                .append("from account_detail d ")
                .append("where d.active = 1 ");
        fillWhere(queryAccountDetailDTO, sql);
        Map<String, Object> map = buildParams(queryAccountDetailDTO, accountId);
        return accountDetailRepository.countByCondition(sql.toString(), map);
    }

    private void fillWhere(QueryAccountDetailDTO queryAccountDetailDTO, StringBuffer sql) {
        if (queryAccountDetailDTO.getStartTime() != null) {
            sql.append(" and d.create_time >=:startTime");
        }
        if (queryAccountDetailDTO.getEndTime() != null) {
            sql.append(" and d.create_time <=:endTime");
        }
        if (queryAccountDetailDTO.getAccountId() != null) {
            sql.append(" and d.account_id =:accountId");
        }
    }

    private Map<String, Object> buildParams(QueryAccountDetailDTO queryAccountDetailDTO, Long accountId) {
        Map<String, Object> params = new HashMap<>();
        if (queryAccountDetailDTO.getStartTime() != null) {
            params.put("startTime", queryAccountDetailDTO.getStartTime());
        }
        if (queryAccountDetailDTO.getEndTime() != null) {
            params.put("endTime", queryAccountDetailDTO.getEndTime());
        }
        if (accountId != null) {
            params.put("accountId", accountId);
        }
        return params;
    }

    @Override
    public List<QueryAccountDetailDTO> findByCondition(QueryAccountDetailDTO queryAccountDetailDTO, Long accountId) {
        queryAccountDetailDTO.setAccountId(accountId);
        StringBuffer sql = new StringBuffer();
        sql.append("select d.* ")
                .append("from account_detail d ")
                .append("where d.active = 1 ");
        fillWhere(queryAccountDetailDTO, sql);
        sql.append(" order by d.id desc ");
        Map<String, Object> map = buildParams(queryAccountDetailDTO, accountId);
        List<AccountDetail> accountDetails = accountDetailRepository.findByCondition(sql.toString(), queryAccountDetailDTO.getStartIndex(), queryAccountDetailDTO.getPageSize(), map);
        return accountDetailConverter.toQueryDTOs(accountDetails);
    }

    @Override
    public BigDecimal findAmountByDateAndType(Date start, Date end, String type) {
        return accountDetailRepository.sumAmountByDateAndType(start, end, type);
    }

    @Override
    public List findChargeDetailByDate(String startDateStr, String endDateStr) {
        if(StringUtils.isBlank(startDateStr) || StringUtils.isBlank(endDateStr)) {
            return Collections.emptyList();
        }
        Date startDate = DateUtils.parseDate(startDateStr, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        Date endDate = DateUtils.parseDate(endDateStr, DateUtils.TimeType.yyyy_MM_ddHHmmSS);
        return accountDetailRepository.getRechargeByDate(Arrays.asList(AmountType.PAY.name(), AmountType.GIVEN.name()),startDate,endDate);
    }
}
