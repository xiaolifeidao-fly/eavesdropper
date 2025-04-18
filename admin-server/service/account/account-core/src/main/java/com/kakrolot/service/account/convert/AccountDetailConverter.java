package com.kakrolot.service.account.convert;

import com.kakrolot.service.account.api.dto.AccountDetailDTO;
import com.kakrolot.service.account.api.dto.QueryAccountDetailDTO;
import com.kakrolot.service.account.dao.po.AccountDetail;
import com.kakrolot.service.common.convert.CommonConvert;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class AccountDetailConverter extends CommonConvert<AccountDetailDTO, AccountDetail> {

    public List<QueryAccountDetailDTO> toQueryDTOs(List<AccountDetail> accountDetails) {
        if (accountDetails == null) {
            return Collections.emptyList();
        }
        return accountDetails.stream().map(this::toQueryDTO).collect(Collectors.toList());
    }

    private QueryAccountDetailDTO toQueryDTO(AccountDetail accountDetail) {
        QueryAccountDetailDTO queryAccountDetailDTO = new QueryAccountDetailDTO();
        BeanUtils.copyProperties(accountDetail, queryAccountDetailDTO);
        return queryAccountDetailDTO;
    }
}
