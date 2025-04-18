package com.kakrolot.service.account.dao.repository;

import com.kakrolot.service.account.dao.po.ProfitPay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;

public interface ProfitPayRepository extends JpaRepository<ProfitPay, Long> {

    ProfitPay findByDate(Date date);

    List<ProfitPay> findByStatus(String status);
}
