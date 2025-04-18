package com.kakrolot.service.account.api;

import com.kakrolot.service.account.api.dto.AccountDTO;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

public interface AccountService {
    void save(AccountDTO accountDTO);

    AccountDTO findByUserId(Long userId);

    @Transactional
    void updateAmountById(BigDecimal balanceAmount, Long id);

    @Transactional
    void blockAccount(Long id);

    AccountDTO findById(Long accountId);

}
