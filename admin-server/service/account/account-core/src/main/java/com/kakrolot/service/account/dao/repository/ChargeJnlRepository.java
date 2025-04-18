package com.kakrolot.service.account.dao.repository;

import com.kakrolot.service.account.dao.po.ChargeJnl;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChargeJnlRepository extends JpaRepository<ChargeJnl, Long> {

    ChargeJnl findByProfitPayIdAndType(Long profitPayId, String type);
}
