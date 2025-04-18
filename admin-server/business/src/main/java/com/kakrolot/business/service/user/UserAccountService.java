package com.kakrolot.business.service.user;

import com.kakrolot.business.service.BaseService;
import com.kakrolot.business.service.ResponseUtils;
import com.kakrolot.business.service.response.Response;
import com.kakrolot.service.account.api.AccountDetailService;
import com.kakrolot.service.account.api.AccountService;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.account.api.dto.AccountDetailDTO;
import com.kakrolot.service.account.api.dto.AccountStatus;
import com.kakrolot.service.account.api.dto.AmountType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class UserAccountService extends BaseService {

    @Autowired
    private AccountService accountService;

    @Autowired
    private AccountDetailService accountDetailService;


    @Transactional
    public Response handlerAmount(AccountDTO accountDTO, BigDecimal amount, String ip, String operator, AmountType amountType, String businessId) {
        if (!AccountStatus.ACTIVE.name().equals(accountDTO.getAccountStatus())) {
            return ResponseUtils.buildError("账户已被冻结,不能进行操作");
        }
        saveAccountDetail(accountDTO, amount, ip, operator, amountType, businessId);
        accountService.updateAmountById(accountDTO.getBalanceAmount(), accountDTO.getId());
        return ResponseUtils.buildSuccess("操作成功");
    }

    @Transactional
    public Response payAndGivenAmount(AccountDTO accountDTO, BigDecimal amount, int givenScale, String ip, String operator) {
        if (!AccountStatus.ACTIVE.name().equals(accountDTO.getAccountStatus())) {
            return ResponseUtils.buildError("账户已被冻结,不能进行操作");
        }
        Response givenResponse = givenAmount(accountDTO, amount, givenScale, ip, operator);
        if (!ResponseUtils.isSuccess(givenResponse)) {
            return givenResponse;
        }
        accountDTO = accountService.findById(accountDTO.getId());
        return payAmount(accountDTO, amount, ip, operator);
    }

    private Response givenAmount(AccountDTO accountDTO, BigDecimal amount, int givenScale, String ip, String operator) {
        if (givenScale > 0) {
            BigDecimal givenAmount = amount.multiply(BigDecimal.valueOf(givenScale)).divide(BigDecimal.valueOf(100));
            String givenBusinessId = UUID.randomUUID().toString();
            handlerAmount(accountDTO, givenAmount, ip, operator, AmountType.GIVEN, givenBusinessId);
        }
        return ResponseUtils.buildSuccess("无需赠送");
    }

    private Response payAmount(AccountDTO accountDTO, BigDecimal amount, String ip, String operator) {
        String payBusinessId = UUID.randomUUID().toString();
        return handlerAmount(accountDTO, amount, ip, operator, AmountType.PAY, payBusinessId);
    }

    public void saveAccountDetail(AccountDTO accountDTO, BigDecimal amount, String ip, String operator, AmountType amountType, String businessId) {
        AccountDetailDTO accountDetailDTO = new AccountDetailDTO();
        accountDetailDTO.setAccountId(accountDTO.getId());
        accountDetailDTO.setAmount(amount.multiply(BigDecimal.valueOf(amountType.getPrice())));
        accountDetailDTO.setOperator(operator);
        accountDetailDTO.setIp(ip);
        accountDetailDTO.setType(amountType.name());
        BigDecimal oldBalanceAmount = accountDTO.getBalanceAmount();
        if (oldBalanceAmount == null) {
            oldBalanceAmount = BigDecimal.ZERO;
        }
        BigDecimal balanceAmount = oldBalanceAmount.add(amount.multiply(BigDecimal.valueOf(amountType.getPrice())));

        accountDTO.setBalanceAmount(balanceAmount);
        accountDetailDTO.setBalanceAmount(balanceAmount);
        accountDetailDTO.setDescription(amountType.getDesc() + ":" + amount.toString() + "元");
        accountDetailDTO.setBusinessId(businessId);
        accountDetailService.save(accountDetailDTO);
    }

}
