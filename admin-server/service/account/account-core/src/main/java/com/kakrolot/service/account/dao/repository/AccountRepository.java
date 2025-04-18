package com.kakrolot.service.account.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.account.dao.po.Account;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface AccountRepository extends CommonRepository<Account, Long> {

    Account getByUserId(Long userId);

    @Query(nativeQuery = true, value = "update account set balance_amount=:balanceAmount where id =:id")
    @Modifying
    void updateAmountById(@Param("balanceAmount") BigDecimal balanceAmount, @Param("id") Long id);

    @Query(nativeQuery = true, value = "update account set account_status=:accountStatus where id =:id")
    @Modifying
    void updateAccountStatusById(@Param("accountStatus") String accountStatus, @Param("id") Long id);

    Account getById(Long accountId);
}
