package com.kakrolot.service.account.api;

import com.kakrolot.service.account.api.dto.AccountDetailDTO;
import com.kakrolot.service.account.api.dto.QueryAccountDetailDTO;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public interface AccountDetailService {

    void save(AccountDetailDTO accountDetailDTO);

    Long countByCondition(QueryAccountDetailDTO queryAccountDetailDTO, Long accountId);

    List<QueryAccountDetailDTO> findByCondition(QueryAccountDetailDTO queryAccountDetailDTO, Long accountId);

    BigDecimal findAmountByDateAndType(Date start, Date end, String type);

    /**
     * 获取充值明细
     * @param startDateStr
     * @param endDateStr
     * @return
     */
    List findChargeDetailByDate(String startDateStr, String endDateStr);
}
