package com.kakrolot.service.account.convert;

import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.account.dao.po.Account;
import com.kakrolot.service.common.convert.CommonConvert;
import org.springframework.stereotype.Component;

@Component
public class AccountConverter extends CommonConvert<AccountDTO, Account> {

}
