package com.kakrolot.service.account;

import com.kakrolot.service.account.api.AccountService;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.account.api.dto.AccountStatus;
import com.kakrolot.service.account.convert.AccountConverter;
import com.kakrolot.service.account.dao.po.Account;
import com.kakrolot.service.account.dao.repository.AccountRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountConverter accountConverter;

    @Override
    public void save(AccountDTO accountDTO) {
        Account account = accountConverter.toPo(accountDTO);
        accountRepository.save(account);
    }

    @Override
    public AccountDTO findByUserId(Long userId) {
        Account account = accountRepository.getByUserId(userId);
        return accountConverter.toDTO(account);
    }

    @Override
    public void updateAmountById(BigDecimal balanceAmount, Long id) {
        accountRepository.updateAmountById(balanceAmount, id);
    }

    @Override
    public void blockAccount(Long id) {
        accountRepository.updateAccountStatusById(AccountStatus.BLOCK.name(), id);
    }

    @Override
    public AccountDTO findById(Long accountId) {
        Account account = accountRepository.getById(accountId);
        return accountConverter.toDTO(account);
    }
}
