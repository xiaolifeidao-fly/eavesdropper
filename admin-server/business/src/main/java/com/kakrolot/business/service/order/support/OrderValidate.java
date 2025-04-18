package com.kakrolot.business.service.order.support;

import com.kakrolot.business.service.ResponseUtils;
import com.kakrolot.business.service.response.Response;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.account.api.dto.AccountStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Slf4j
public class OrderValidate {

    public Response validate(AccountDTO accountDTO, BigDecimal orderAmount) {
        if (accountDTO == null) {
            log.warn("could not found accountDTO");
            return ResponseUtils.buildError("未找到账户");
        }
        if (!isAllowSubmit(orderAmount, accountDTO)) {
            log.warn("the account is limit or amount is limit by {}", accountDTO);
            return ResponseUtils.buildError("账户被冻结或余额不足");
        }
        return ResponseUtils.buildSuccess("校验成功");
    }

    private boolean isAllowSubmit(BigDecimal orderAmount, AccountDTO accountDTO) {
        if (!AccountStatus.ACTIVE.name().equals(accountDTO.getAccountStatus())) {
            return false;
        }
        BigDecimal balanceAmount = accountDTO.getBalanceAmount();
        if (balanceAmount == null || balanceAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        if (balanceAmount.subtract(orderAmount).compareTo(BigDecimal.ZERO) < 0) {
            return false;
        }
        return true;
    }
}
